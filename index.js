const Alexa = require('ask-sdk-core');
let Request = require('request'); 
let requestPromise = require('request-promise');

// add request handler for alexa launch request 

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        console.log("Launch Request Intent received");
      return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
      const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Hello World', speechText)
        .getResponse();
    }
  };

  // request handler for Hello world intent 

  const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
    },
    async handle(handlerInput) {
      const speechText = 'Welcome to Hello World!';


      console.log(handlerInput);
  
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Hello World', speechText)
        .getResponse();
     

       

    }
  };

   // request handler for WeatherIntent

   const WeatherIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'WeatherIntent'
        && handlerInput.requestEnvelope.request.dialogState === 'COMPLETED';
    },
    async handle(handlerInput) {
      // respond with LUIS integration response 
      let city = handlerInput.requestEnvelope.request.intent.slots.location.value;
      let date = handlerInput.requestEnvelope.request.intent.slots.day.value;
      console.log('Received Day -',handlerInput.requestEnvelope.request.intent.slots.day.value);
      console.log('Received City -',handlerInput.requestEnvelope.request.intent.slots.location.value);

        let speechText = 'Dummy initial String';
       // let queryString = "what%20is%20the%20weather%20in%20Noida%20tomorrow";
        console.log("About to call LUIS endpoint via request promise");
      

        var options = {
            uri:'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/c0de2747-69a0-4508-9438-1e0375be903a',
            headers:'application/json',
            qs:{
                'subscription-key':'5e33b3236eae412da17ac19cd9b200d5',
                q:`what is the weather in ${city} ${date}`
            }
        
        };

        
        let apiresponse = await requestPromise(options).then(function(resp){
        
            console.log('response',resp);
            console.log("successfully completed");
            speechText = `LUIS parsed top intent score ${JSON.parse(resp).topScoringIntent.score} and LUIS parsed date is ${JSON.parse(resp).entities[0].resolution.values[0].timex} and LUIS parsed city is ${city} `;
            console.log(speechText);
            console.log('generated response :',handlerInput.responseBuilder.speak(speechText).withSimpleCard('QuizBot', speechText).getResponse());
            return (handlerInput.responseBuilder.speak(speechText).withSimpleCard('QuizBot', speechText).getResponse());
           // return speechText;
        
        }).catch(function(err){
            console.log('error occurred',err); 
            console.log("error received");
            speechText = JSON.parse(err);
            return handlerInput.responseBuilder.speak(speechText).withSimpleCard('Quiz Bot', err).getResponse();
          //   return speechText;
        });
        
        console.log("call completed for LUIS endpoint");
        console.log('API response -',apiresponse);
        console.log('speech Text',speechText);
        return apiresponse;
    }
};

  // help intent handler 

  const HelpIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
      const speechText = 'You can say hello to me!';
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Hello World', speechText)
        .getResponse();
    }
  };

  // cancel and stop handler 

  const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
          || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
      const speechText = 'Goodbye!';
  
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Hello World', speechText)
        .getResponse();
    }
  };

  // session end handler

  const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
      //any cleanup logic goes here
      return handlerInput.responseBuilder.getResponse();
    }
  };

  // error handler 

  const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);
  
      return handlerInput.responseBuilder
        .speak('Sorry, I can\'t understand the command. Please say again.')
        .reprompt('Sorry, I can\'t understand the command. Please say again.')
        .getResponse();
    },
  };

  // lambda function handler to route alexa skill request for appropriate request handler 

  let skill;

exports.handler = async function (event, context) {
  console.log(`REQUEST++++${JSON.stringify(event)}`);
  console.log('Request received to myAlexaLambda function'+JSON.stringify(event));
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        WeatherIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  console.log(event);
  let response = await skill.invoke(event, context);
  //await skill.invoke(event, context);
 // console.log('Fullfillment intent -',event);
  console.log("call completed for handler");
  console.log(response);
 // console.log(`RESPONSE received from invoked intent ++++ ${JSON.stringify(response)}`);

  return response;
 // return 'LUIS parsed top intent score:0.982207537 and parsed date is :2019-03-19';



};



