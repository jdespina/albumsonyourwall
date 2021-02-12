/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */


var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var path = require('path');
var fetch = require('node-fetch');
var compression = require('compression');
process.env.NODE_ENV = 'production';
var https = require('https');
var fs = require('fs');
var helmet = require('helmet')
var cors = require('cors');
var favicon = require('serve-favicon');
var hbs = require('express-handlebars');

var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const { appendFileSync } = require('fs');
const { nextTick, on } = require('process');
const e = require('express');
let port = process.env.PORT || 3000;
var client_id = 'ClientID'; // Your client id
var client_secret = 'SecretKey'; // Your secret
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};
let authTok = "";
request.post(authOptions,  function (error, response, body) {
  if (!error && response.statusCode === 200) {
    authTok = body.access_token;
    console.log(body)
  }
});
function refreshCredential() {
  console.log("Access Token Expired");
  console.log("Getting New Token");
  request.post(authOptions,  function (error, response, body) {
    if (!error && response.statusCode === 200) {
      authTok = body.access_token;
      console.log(body)
    }
  });
}
setInterval(refreshCredential, 3599000)
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'artistAlbumsPage', layoutsDir: __dirname + "/public/" }))
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'hbs');
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy:false
}));
app.use(compression());
// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ['none'],
//     scriptSrc: ["'self'", 'unsafe-inline', 'unsafe-hashes',' http://code.jquery.com/jquery-1.10.1.min.js ', 'http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js', ' http://cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0-alpha.1/handlebars.min.js'],
//     styleSrc: ['https://fonts.googleapis.com/css?family=Playfair+Display&display=swap',"'self'", "'unsafe-inline'", "'unsafe-hashes'","//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css"],
//     fontSrc: ["'self'", 'maxcdn.bootstrapcdn.com'],
//     "img-src": ["*"],
//     "connect-src": ["*","self"]  
//   }
// }));
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/getMoreAlb', cors(), function (req, res) {
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = authTok;
      var artURI = req.query.URI;
      var offset = req.query.offset * 10;
      var optionsAlb = {
        url: "https://api.spotify.com/v1/artists/" + artURI + "/albums?market=US&include_groups=album,single&limit=10&offset=" + offset,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + access_token
        },
        json: true
      }
      //Gets ablum List for artist 
      request.get(optionsAlb, async (err, response, body) => {
        if (err) {
          res.sendStatus(404);
        }
        let uniqueMatches = preventDuplicates(body.items);
        resultDiv = resultsAlbumDiv(uniqueMatches, access_token);
        if (body.next == null) {
          res.json({
            end: true,
            div: resultDiv
          });
        }
        else {
          res.json({
            end: false,
            div: resultDiv
          });
        }
      });
    }
  });
  
});
app.get('/viewAlbums?\*', cors(),  function (req, res) {
      const urlParams = new URLSearchParams(req.query);
      let artID = urlParams.get('artistid');
      let artName = urlParams.get('name');
      var background = "";
      var artistsInfo = {
        url: "https://api.spotify.com/v1/artists/" + artID,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + authTok
        },
        json: true
      }
  request.get(artistsInfo, async (err, response, body) => {
        if (response.statusCode == 401) {
          res.redirect('/')
        }
        if (err) {
          res.sendStatus(404);
        }
        try {
          background = await body.images[0].url;
        }
        catch (err) {
          console.log("Failed async when getting background" + err);
          refreshCredential();
        }
        
        let resultDiv = "";
        var optionsAlb = {
          url: "https://api.spotify.com/v1/artists/" + artID + "/albums?market=US&include_groups=album,single&limit=10",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + authTok
          },
          json: true
        }
        //Gets ablum List for artist 
        request.get(optionsAlb, (err, response, body) => {
          if (response.statusCode == 401) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.redirect('/')
          }
          if (err) {
            res.sendStatus(404);
          }
          let uniqueMatches = preventDuplicates(body.items);
          resultDiv = resultsAlbumDiv(uniqueMatches, authTok);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.render("artistAlbumsPage", { title: artName, artBack: background, resultBody: resultDiv });

        });
      });
});
app.get('/poster?\*', function (req, res) {
      const urlParams = new URLSearchParams(req.query);
      let albID = urlParams.get('albumId');
      var background = "";
      var albumInfo = {
        url: "https://api.spotify.com/v1/albums/" + albID,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + authTok
        },
        json: true
      }
      request.get(albumInfo,  (err, response, body) => {
        if (err) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.sendStatus(404);
        }
        if (response.statusCode == 401) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.redirect('/')
        }
        else {
          let trackListHTML = trackList(body.tracks.items);
          let duration = getMilliTracks(body.tracks.items);
          let artistNames = getArtistNames(body.artists);
          let releaseDate = body.release_date;
          let recordLabel = body.label;
          let copyRights = body.copyrights[0].text;
          if (body.album_type == "single") {
            trackListHTML = getTrack(body.name, body.external_urls.spotify);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.render("artistAlbumsPage", {
              layout: 'singleTemp.hbs',
              pureName: body.name,
              name: trackListHTML,
              albImage: body.images[0].url,
              artistName: body.artists[0].name,
              tracks: trackListHTML,
              release_date: releaseDate.slice(0, 4),
              durationTime: duration,
              recordlabel: recordLabel,
              copyrights: copyRights
            });
          }
          else {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.render("artistAlbumsPage", {
              layout: 'posterTemp.hbs',
              name: body.name,
              albImage: body.images[0].url,
              artistName: artistNames,
              tracks: trackListHTML,
              durationTime: duration,
              release_date: releaseDate.slice(0, 4),
              recordlabel: recordLabel

            });
          }
        }

      });
});
function getMilliTracks(matches) {
  let total = 0;
  for (let i = 0; i < matches.length; i++) {
    total += matches[i].duration_ms;
  }
  return msToTime(total);
}
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  if (hours == "00") {
    return minutes + ":" + seconds;
  }
  else {
    return hours + ":" + minutes + ":" + seconds;
  }

}
function getCopyRights(matches) {
  const html = matches.map(match => `
  <small>${match.text}</small>`).join('');
  return html;
}
function preventDuplicates(matches) {
  if (matches.length != 0) {
    for (let keys in matches) {
    }
    let onlyUnique = [];
    for (let i = 0; i < matches.length - 1; i++) {
      if (matches[i].name !== matches[i + 1].name) {
        onlyUnique.push(matches[i]);
      }
    }
    onlyUnique.push(matches[matches.length - 1]);
    return onlyUnique
  }
  return [];


}
function trackList(matches) {
  const html = matches.map(match => `
  <a href="${match.external_urls.spotify}">
  <p>${match.track_number}. ${match.name}</p>
  </a>`).join('');
  return html;
}
function getTrack(matches, url) {
  let html = '<a id="title1" href="' + url + '">' + matches + '</a>'
  return html;
}
function getArtistNames(matches) {
  const html = matches.map(match => `
  ${match.name}`).join('');
  return html;
}
function resultsAlbumDiv(matches, token) {
  const html = matches.map(match => `
    <a href="/poster?albumId=${match.id}">
			<div style="height:415px;width:320px;padding:25px;word-wrap: break-word;">
				<img src="${match.images[0].url}" alt="${match.name} Picture">
        <h4>${match.name}</h4>
        <h8> ${match.release_date}</h8>
      </div>
    </a>`).join('');//<= Gets Rid of quotes
  return html;
}
app.get('/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});
//These functions is only if I decide to make search function server side.
app.get('/search', async (req, res) => {
  let searchTerm = req.query.search_term;
  let result = "";
  try {
    searchTerm = searchTerm.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    //console.log(searchTerm);
    result = await searchState(searchTerm, authTok);
  }
  catch (err) {
    console.log("This is an error in /search " + err);
    refreshCredential();
  }
  res.send({
    'search_result': result
  })
});

const searchState = async (searchText, toke) => {
  
  if (searchText.length != 0) {
    let res;
    let states
    try {
      res = await fetch("https://api.spotify.com/v1/search?q=" + searchText + "&type=artist&limit=10&offset=0", {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + toke
        }
      });
    }
    catch (err) {
      console.log("Something went wrong when fetching " + err);
      refreshCredential();
    }
    try {
      states = await res.json();
    }
    catch (err) {
      console.log("Something went wrong with the response " + err);
      refreshCredential();
    }
    
    let matches = [];
    for (keys in states.artists.items) {
      matches.push(states.artists.items[keys]);
    }
    for (keys in matches) {
      if (matches[keys].images.length == 0) {
        matches[keys].images.push({ url: "https://cdn.iconscout.com/icon/free/png-256/spotify-11-432546.png" });
      }
    }
    if (searchText.length === 0) {
      matches = [];

      return "";
    }
    else {
      return showResultsInHTML(matches, toke);
    }
  }
  else {
    return "";
  }
}
const showResultsInHTML = (matches, toke) => {
  if (matches.length > 0) {
    //<a href="${match.external_urls.spotify}"></a>
    const html = matches.map(match => `
		<a href="/viewAlbums?artistid=${match.id}&name=${match.name}">
			<div>
				<img src="${match.images[0].url}" alt="${match.name} Picture">
				<h4>${match.name} </h4>
			</div>
		</a>`).join('');//<= Gets Rid of quotes
    return html;
  }
}
console.log(`Listening on port ${port}`);
app.listen(port);