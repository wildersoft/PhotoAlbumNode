var app = require('express')();
var http = require('http');
var server = http.Server(app);
var settings = require('./settings.json');
//const port = 3003;
const port = process.env.PORT || 8080;


const apiAddress = settings.apiAddress;

server.listen(port, () => {
    console.log(`server is runnning by port: ${port}`);
});

app.get('/', (request, response) => {
    console.log("index");
    response.sendFile(__dirname + '/public/index.html')
});

app.get('/Albums', (request, response) => {
    var dataJson = getApiContent(`${apiAddress}/albums`, (dataJson) => {
        response.setHeader('Content-Type', 'application/json');
        response.send(dataJson);
    });
});

app.get('/Photos/:albumid', (request, response) => {
    var albumId = request.params.albumid;
    var dataJson = getApiContent(`${apiAddress}/albums/${albumId}/photos`, (dataJson) => {
        response.setHeader('Content-Type', 'application/json');
        response.send(dataJson);
    });
});

app.get('/Comments/:postid', (request, response) => {
    var postId = request.params.postid;
    var dataJson = getApiContent(`${apiAddress}/posts/${postId}/comments`, (dataJson) => {
        response.setHeader('Content-Type', 'application/json');
        response.send(dataJson);
    });
});

function callApi(url){
    getApiContent(url, (dataJson) => {
        return dataJson;
    });
}

function getApiContent(url, returnCallback){
    http.get(url, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
        let error;
        if (statusCode !== 200) {
            error = new Error(`Request Failed.\n Status Code: ${statusCode}`);
        }
        else if (!/^application\/json/.test(contentType)) {
            error = new Error(`Invalid content-type.\n Expected application/json but received ${contentType}`);
        }

        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                var parsedData = JSON.parse(rawData);
                returnCallback(parsedData);
            }
            catch (e) {
                console.error(e.message);
            }
        });
    })
    .on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}
