var express = require('express')
var app = express()
var Discogs = require('disconnect').Client
var admin = require("firebase-admin");
var serviceAccount = require('./discogs-digger-1bd36-firebase-adminsdk-lxhwi-e5f19dddcb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://discogs-digger-1bd36.firebaseio.com"
});

function getInventory(user) {
  return new Promise(resolve => {
    function finish() {
      return Promise.all(promises).then(all => {
        const data = new Map()
        all.forEach(page => {
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
    const firstRequest = new Discogs().marketplace().getInventory(user, {per_page: 1000})
    const promises = [firstRequest]
    return firstRequest.then(res => {
      const lastPage = Math.ceil(res.pagination.items / res.pagination.per_page);

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
        const request = new Discogs().marketplace().getInventory(user, {per_page: 1000, page, sort: 'artist', sort_order})
        promises.push(request)
        return request.then(() => getNextPage(page + 1, limit, sort_order))
      }

      return getNextPage(1, lastPage);
    })
  })
}

app.get('/dig/:buyer/:seller', async (req, res) => {
  const {buyer, seller} = req.params
  const dbRef = admin.database().ref(`inventory/${seller}`)

  // get possible inventory from db
  let inventory = (await dbRef.once('value')).val()

  // if inventory does not exist, cache it
  if (!inventory) {
    inventory = await getInventory(seller)
    dbRef.set(inventory)
  }

  res.json(inventory)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})