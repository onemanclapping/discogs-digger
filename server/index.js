const express = require('express');
const app = express();
const Discogs = require('disconnect').Client;
const cookieParser = require('cookie-parser');
const proxy = require('express-http-proxy');
const morgan = require('morgan');
const fs = require('fs');
const logFile = fs.createWriteStream('./digger.log', {flags: 'a'}); //use {flags: 'w'} to open in write mode


// require('./throttled-disconnect.js');
require('./throttled-disconnect2.js');

app.use(cookieParser());
app.use(morgan("combined", {stream: logFile}))


const keys = {
	consumerKey: 'uyNlWLZmSEGTNVJHFCyZ', 
	consumerSecret: 'LJAxFHXDkWPJJesvYzOwOuwOxeGBkCWM'
}

app.get('/api/authorize', function(req, res){
    var oAuth = new Discogs().oauth();
	oAuth.getRequestToken(
		keys.consumerKey,
		keys.consumerSecret,
		'http://localhost:3000/api/callback',
		function(err, requestData){
            res.cookie('token', requestData.token, { maxAge: 900000, httpOnly: true });
            res.cookie('tokenSecret', requestData.tokenSecret, { maxAge: 900000, httpOnly: true });
            res.cookie('authorizeUrl', requestData.authorizeUrl, { maxAge: 900000, httpOnly: true });
			// Persist "requestData" here so that the callback handler can 
			// access it later after returning from the authorize url
			res.redirect(requestData.authorizeUrl);
		}
	);
});

app.get('/api/callback', function(req, res){
    const {token, tokenSecret, authorizeUrl} = req.cookies;
    var dataCenas = {
        method: 'oauth',
        level: 0,
        consumerKey: keys.consumerKey,
        consumerSecret: keys.consumerSecret,
        token,
        tokenSecret,
        authorizeUrl
    }
    var oAuth = new Discogs(dataCenas).oauth();

	oAuth.getAccessToken(
		req.query.oauth_verifier, // Verification code sent back by Discogs
		function(err, accessData){
            // Persist "accessData" here for following OAuth calls 
            res.cookie('token', accessData.token, { maxAge: 900000 });
            res.cookie('tokenSecret', accessData.tokenSecret, { maxAge: 900000 });
            res.clearCookie('authorizeUrl');
            res.redirect('/');
		}
	);
});

function generateAuthOptions(cookies) {
    return {
        method: 'oauth',
        level: 2,
        consumerKey: keys.consumerKey,
        consumerSecret: keys.consumerSecret,
        token: cookies.token,
        tokenSecret: cookies.tokenSecret
    }
}

app.get('/api/identity', function(req, res){
	const discogs = new Discogs(generateAuthOptions(req.cookies));
	discogs.getIdentity(function(err, data){
		res.send(data);
	});
});

const buyerStatus = {};
const buyerPromises = {};
app.get('/api/buyer/:buyerId', async (req, res) => {
    const buyerId = req.params.buyerId;
    let result;

    // If this is the first request for this buyer, create a promise to be reused in case there is a similar request
    // before this one completes
    if (!buyerPromises[buyerId]) {
        buyerPromises[buyerId] = {
            promise: new Promise(async resolve => {
                const discogs = new Discogs(generateAuthOptions(req.cookies));
                let totalPages = 1;
                const artists = new Set();

                for (let actualPage = 1; actualPage <= totalPages; actualPage++) {
                    let result = await discogs.user().collection().getReleases(buyerId, 0, {per_page: 100, page: actualPage, sort: 'artist', sort_order: 'asc'});
                    totalPages = result.pagination.pages;
                    result.releases.forEach(rel => rel.basic_information.artists.forEach(artist => artists.add(artist.name)));
                    buyerStatus[buyerId] = Math.floor(actualPage/totalPages*100);
                }

                delete buyerStatus[buyerId];

                result = [...artists.values()];

                resolve(result);
            }),
            refCount: 0
        }
    }

    buyerPromises[buyerId].refCount++;
    result = await buyerPromises[buyerId].promise;
    buyerPromises[buyerId].refCount--;
    

    // If there are no subscribers left for this promise, delete it
    if (buyerPromises[buyerId].refCount === 0) {
        delete buyerPromises[buyerId];
    }
    res.json(result);
});

app.get('/api/status/buyer/:buyerId', async (req, res) => {
    const buyerId = req.params.buyerId;
    res.json(buyerStatus[buyerId] || 0);
});

// SELLER STUFF

function transformListing(listing) {
    const limit = listing.release.description.indexOf(` - `);
    const artist = listing.release.description.substring(0, limit);
    const title = listing.release.description.substring(limit + 3);
    const lastOpen = listing.release.description.lastIndexOf('(');
    const lastClose = listing.release.description.lastIndexOf(')');
    const types = listing.release.description.substring(lastOpen + 1, lastClose).split(',').map(s => s.trim());

    return {
        condition: listing.condition,
        price: listing.price.value,
        currency: listing.price.currency,
        uri: listing.uri,
        artist,
        title,
        types
    };
}

const sellerStatus = {};
const sellerPromises = {};
app.get('/api/seller/:sellerId', async (req, res) => {
    const sellerId = req.params.sellerId;

    // If this is the first request for this seller, create a promise to be reused in case there is a similar request
    // before this one completes
    if (!sellerPromises[sellerId]) {
        sellerPromises[sellerId] = {
            promise: new Promise(async resolve => {
                const discogs = new Discogs(generateAuthOptions(req.cookies));
                let totalPages = 1;
                const listings = [];
                

                for (let actualPage = 1; actualPage <= totalPages; actualPage++) {
                    let page = actualPage <= 100 ? actualPage : actualPage - 100;
                    let sort_order = actualPage <= 100 ? 'asc' : 'desc';
                    let result = await discogs.marketplace().getInventory(sellerId, {per_page: 100, page, sort: 'artist', sort_order});
                    totalPages = Math.min(result.pagination.pages, 200);
                    result.listings.forEach(listing => listings.push(transformListing(listing)));
                    sellerStatus[sellerId] = Math.floor(actualPage/totalPages*100);
                }
                
                delete sellerStatus[sellerId];

                result = listings;

                resolve(result);
            }),
            refCount: 0
        }
    }

    sellerPromises[sellerId].refCount++;
    result = await sellerPromises[sellerId].promise;
    sellerPromises[sellerId].refCount--;

    // If there are no subscribers left for this promise, delete it
    if (sellerPromises[sellerId].refCount === 0) {
        delete sellerPromises[sellerId];
    }    

    res.json(result);
});

app.get('/api/status/seller/:sellerId', async (req, res) => {
    const sellerId = req.params.sellerId;
    res.json(sellerStatus[sellerId] || 0);
});

app.use(proxy('localhost:4200'));

app.listen(3000, () => console.log('Discogs Digger listening on port 3000'))