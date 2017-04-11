var express = require('express')
var app = express()
var Discogs = require('disconnect').Client

function getInventory(user) {
  
  return new Promise(resolve => {
    function finish() {
      return Promise.all(promises).then(all => {
        resolve(all.length)
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

app.get('/', function (req, res) {
  // var col = new Discogs().user().collection().getReleases('onemanclap', 0, {
  //   per_page: 1000
  // })
  // col.then(res => {
  //   console.log(res.releases.length)
  // })

  // var cenas = new Discogs().marketplace().getInventory('MUNSTERAMA', {
  //   per_page: 1000
  // })
  // cenas.then(res => {
  //   console.log('1')
  //   const lastPage = Math.ceil(res.pagination.items / res.pagination.per_page);
  //   const promises = [cenas];
  //   let a = 1;
  //   for (let i = 1; i <= lastPage; i++) {
  //     promises.push(new Discogs().marketplace().getInventory('MUNSTERAMA', {
  //       per_page: 1000,
  //       page: i
  //     }).then(r => {
  //       console.log(i + 'done')
  //       console.log(a++)
  //     }, e => console.log(e)))
  //   }

  //   Promise.all(promises).then(r => console.log(r))
    
    


  //   console.log(lastPage)
  // }, e => console.log(e))

  getInventory('kaleidosmoker').then(count => console.log(count))

  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})