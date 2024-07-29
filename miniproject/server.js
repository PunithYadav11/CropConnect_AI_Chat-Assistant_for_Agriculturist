const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Handle POST requests to /webhook
app.post('/webhook', function (req, res) {
    console.log('Received request:', req.body);
    const intent = req.body.queryResult.intent.displayName;

    switch (intent) {
        case 'getweather':
            handleWeatherIntent(req, res);
            break;
        case 'crop-prediction':
            handleCropPredictionIntent(req, res);
            break;
        case 'crop-recommendation':
            handleCropRecommendationIntent(req, res);
            break;
    }
});

// Handle Weather Intent
function handleWeatherIntent(req, res) {
    const city = req.body.queryResult.parameters['geo-city'];
    const dateString = req.body.queryResult.parameters['date'];
    const date = new Date(dateString);
    const month = date.getMonth();
    const day = date.getDate();

    const apiKey = '75763a5f8e4d9a3f3fe43801872fa3cf';
    const apiUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    axios.get(apiUrl)
        .then(response => {
            console.log('Weather API response:', response.data);

            const weatherList = response.data.list;
            let description = "none found";

            for (let i = 0; i < weatherList.length; i++) {
                const weatherDate = new Date(weatherList[i].dt * 1000);

                if (weatherDate.getMonth() === month && weatherDate.getDate() === day) {
                    description = weatherList[i].weather[0].description;
                    break;
                }
            }

            const fulfillmentText = `The weather in ${city} on ${dateString} will be ${description}.`;
            console.log('Fulfillment Text:', fulfillmentText);
            res.json({ fulfillmentText });
        })
        .catch(error => {
            console.error('Weather API Error:', error);
            res.status(500).json({ error: 'Something went wrong' });
        });
}

// Handle Crop Prediction Intent
function handleCropPredictionIntent(req, res) {
    const state = req.body.queryResult.parameters['geo-state'];
    const district = req.body.queryResult.parameters['geo-city'];
    const season = req.body.queryResult.parameters['season'];

    const pythonProcess = spawn('python', ['crop_prediction/ZDecision_Tree_Model_Call.py', state, district, season]);

    let prediction = '';
    pythonProcess.stdout.on('data', (data) => {
        prediction += data.toString();
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        if (code !== 0) {
            console.error(`Python process exited with non-zero code ${code}`);
            res.status(500).json({ error: 'Something went wrong' });
        } else {
            const fulfillmentText = `Crops grown in ${district} during the ${season} season are: ${prediction}`;
            console.log('Fulfillment Text:', fulfillmentText);
            res.json({ fulfillmentText });
        }
    });
}

// Handle Crop Recommendation Intent
function handleCropRecommendationIntent(req, res) {
    const n_params = req.body.queryResult.parameters['number'];
    const p_params = req.body.queryResult.parameters['number1'];
    const k_params = req.body.queryResult.parameters['number2'];
    const t_params = req.body.queryResult.parameters['number3'];
    const h_params = req.body.queryResult.parameters['number4'];
    const ph_params = req.body.queryResult.parameters['number5'];
    const r_params = req.body.queryResult.parameters['number6'];

    const pythonProcess = spawn('python', ['crop_recommendation/recommend.py', n_params, p_params, k_params, t_params, h_params, ph_params, r_params]);

    let prediction = '';
    pythonProcess.stdout.on('data', (data) => {
        prediction += data.toString();
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        if (code !== 0) {
            console.error(`Python process exited with non-zero code ${code}`);
            res.status(500).json({ error: 'Something went wrong' });
        } else {
            const fulfillmentText = `Recommended Crop are: ${prediction}`;
            console.log('Fulfillment Text:', fulfillmentText);
            res.json({ fulfillmentText });
        }
    });
}

// Proxy route to handle CORS issues
app.get('/proxy', (req, res) => {
    const url = req.query.url;
    axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    })
    .then(response => {
        response.data.pipe(res);
    })
    .catch(error => {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
