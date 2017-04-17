const express = require('express')
const app = express()
const Discogs = require('disconnect').Client
const admin = require("firebase-admin")
const serviceAccount = require('./discogs-digger-1bd36-firebase-adminsdk-lxhwi-e5f19dddcb.json')
const removeDiacritics = require('diacritics').remove

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://discogs-digger-1bd36.firebaseio.com"
})

function getInventory(user) {
  return new Promise(resolve => {
    function finish() {
      return Promise.all(promises).then(pages => {
        const data = new Map()
        pages.forEach(page => {
          page.listings.forEach(listing => {
            const limit = listing.release.description.indexOf(` - `)
            const artist = listing.release.description.substring(0, limit)
            const title = listing.release.description.substring(limit + 3)

            data.set(listing.release.id, {
              condition: listing.condition,
              price: listing.price.value,
              currency: listing.price.currency,
              releaseId: listing.release.id,
              uri: listing.uri,
              artist,
              title
            })  
          })
        })

        resolve([...data.values()])
      })
    }
    const firstRequest = new Discogs().marketplace().getInventory(user, {per_page: 100, page: 1, sort: 'artist', sort_order: 'asc'})
    const promises = [firstRequest]
    return firstRequest.then(res => {
      const lastPage = Math.ceil(res.pagination.items / res.pagination.per_page)

      function getNextPage(page, limit, sort_order = 'asc') {
        console.log('going for page', page, sort_order, limit)
        if (page > limit) {
          return finish()
        }
        if (page > 100) {
          if (sort_order === 'desc') {
            return finish()
          }
          else {
            return getNextPage(1, limit - 100, 'desc')
          }
        }
        const request = new Discogs().marketplace().getInventory(user, {per_page: 100, page, sort: 'artist', sort_order})
        promises.push(request)
        return request.then(() => getNextPage(page + 1, limit, sort_order))
      }

      return getNextPage(2, lastPage)
    })
  })
}

function getFavouriteArtists(user) {
  return new Promise(resolve => {
    function finish() {
      return Promise.all(promises).then(pages => {
        const artistSet = new Set()
        
        pages.forEach(page => {
          page.releases.forEach(release => {
            release.basic_information.artists.forEach(artist => {
              artistSet.add(removeDiacritics(artist.name).toLowerCase())
            })
          })
        })
        
        resolve([...artistSet.values()])
      })
    }
    const firstRequest = new Discogs().user().collection().getReleases(user, 0, {per_page: 100, page: 1, sort: 'artist', sort_order: 'asc'})
    const promises = [firstRequest]
    return firstRequest.then(res => {
      const lastPage = Math.ceil(res.pagination.items / res.pagination.per_page)

      function getNextPage(page, limit, sort_order = 'asc') {
        console.log('going for page', page, sort_order, limit)
        if (page > limit) {
          return finish()
        }
        if (page > 100) {
          if (sort_order === 'desc') {
            return finish()
          }
          else {
            return getNextPage(1, limit - 100, 'desc')
          }
        }
        const request = new Discogs().user().collection().getReleases(user, 0, {per_page: 100, page, sort: 'artist', sort_order})
        promises.push(request)
        return request.then(() => getNextPage(page + 1, limit, sort_order))
      }

      return getNextPage(2, lastPage)
    })
  })
}

app.get('/api/:buyer/:seller', async (req, res) => {
  const {buyer, seller} = req.params

  console.log(`digging buyer ${buyer} for seller ${seller}`)

  const inventoryDBRef = admin.database().ref(`inventory/${seller}`)
  const artistsDBRef = admin.database().ref(`artists/${buyer}`)

  // get possible inventory from db
  const t0 = Date.now();
  let inventory = (await inventoryDBRef.once('value')).val()
  console.log(`inventory cache took ${Date.now() - t0}`)

  // if inventory does not exist, cache it
  if (!inventory) {
    const t1 = Date.now();
    inventory = await getInventory(seller)
    console.log(`inventory fetch took ${Date.now() - t1}`)
    inventoryDBRef.set(inventory)
  }

  const t2 = Date.now();
  let favouriteArtists = (await artistsDBRef.once('value')).val()
  console.log(`artists cache took ${Date.now() - t2}`)

  if (!favouriteArtists) {
    const t3= Date.now();
    favouriteArtists = await getFavouriteArtists(buyer)
    console.log(`artists fetch took ${Date.now() - t3}`)
    artistsDBRef.set(favouriteArtists)
  }

  res.json(inventory.filter(item => favouriteArtists.includes(removeDiacritics(item.artist).toLowerCase())))
})

app.listen(3000, function () {
  console.log('Discogs Digger listening on port 3000')
})