const app = require('express')();
const Discogs = require('disconnect').Client;
const cookieParser = require('cookie-parser');

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
            res.cookie('token', accessData.token, { maxAge: 900000, httpOnly: true });
            res.cookie('tokenSecret', accessData.tokenSecret, { maxAge: 900000, httpOnly: true });
            res.clearCookie('authorizeUrl');
            res.send('Received access token!');
		}
	);
});

app.get('/api/identity', function(req, res){
    const {token, tokenSecret} = req.cookies;
    var dataCenas = {
        method: 'oauth',
        level: 2,
        consumerKey: keys.consumerKey,
        consumerSecret: keys.consumerSecret,
        token,
        tokenSecret
    }
	var dis = new Discogs(dataCenas);
	dis.getIdentity(function(err, data){
		res.send(data);
	});
});

app.listen(3000, () => console.log('Discogs Digger listening on port 3000'))