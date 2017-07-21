const app = require('express')();
const Discogs = require('disconnect').Client;
const cookieParser = require('cookie-parser');
const proxy = require('express-http-proxy');
const removeDiacritics = require('diacritics').remove

app.use(cookieParser());

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
app.get('/api/buyer/:buyerId', async (req, res) => {
    const discogs = new Discogs(generateAuthOptions(req.cookies));
    const requestQueue = [{per_page: 100, page: 1, sort: 'artist', sort_order: 'asc'}];
    let totalPages = 1;
    const artists = new Set();
    const buyerId = req.params.buyerId;

    for (let actualPage = 1; actualPage <= totalPages; actualPage++) {
        let result = await discogs.user().collection().getReleases(buyerId, 0, {per_page: 100, page: actualPage, sort: 'artist', sort_order: 'asc'});
        totalPages = result.pagination.pages;
        result.releases.forEach(rel => rel.basic_information.artists.forEach(artist => artists.add(removeDiacritics(artist.name).toLowerCase())));
        buyerStatus[buyerId] = Math.floor(actualPage/totalPages*100);
    }

    res.json([...artists.values()]);
    delete buyerStatus[buyerId];
});

app.get('/api/status/buyer/:buyerId', async (req, res) => {
    const buyerId = req.params.buyerId;
    res.json(buyerStatus[buyerId] || 0);
});

// SELLER STUFF

function transformListing(listing) {
    const limit = listing.release.description.indexOf(` - `)
    const artist = removeDiacritics(listing.release.description.substring(0, limit)).toLowerCase();
    const title = listing.release.description.substring(limit + 3)

    return {
        condition: listing.condition,
        price: listing.price.value,
        currency: listing.price.currency,
        uri: listing.uri,
        artist,
        title
    };
}

const sellerStatus = {};
app.get('/api/seller/:sellerId', async (req, res) => {
    const discogs = new Discogs(generateAuthOptions(req.cookies));
    const requestQueue = [{per_page: 100, page: 1, sort: 'artist', sort_order: 'asc'}];
    let totalPages = 1;
    const listings = [];
    const sellerId = req.params.sellerId;

    for (let actualPage = 1; actualPage <= totalPages; actualPage++) {
        let result = await discogs.marketplace().getInventory(sellerId, {per_page: 100, page: actualPage, sort: 'artist', sort_order: 'asc'})
        totalPages = result.pagination.pages;
        result.listings.forEach(listing => listings.push(transformListing(listing)));
        sellerStatus[sellerId] = Math.floor(actualPage/totalPages*100);
    }

    res.json(listings);
    delete sellerStatus[sellerId];
});

app.get('/api/status/seller/:sellerId', async (req, res) => {
    const sellerId = req.params.sellerId;
    res.json(sellerStatus[sellerId] || 0);
});

app.use(proxy('localhost:4200'));

app.listen(3000, () => console.log('Discogs Digger listening on port 3000'))