
const {RelayConsumer} = require('@signalwire/node')

const consumer = new RelayConsumer({
  project: process.env.SIGNALWIRE_PROJECT_KEY,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['incoming'],

  ready: async ({ client }) => {
    client.__logger.setLevel(client.__logger.levels.DEBUG)
  },

  onIncomingCall: async (call) => {
    const {successful} = await call.answer()
    if (!successful) {
      console.error('Answer Error')
      return
      
    }

    const keyPrompt = {
      type: 'digits',
      digits_max: 1,
      text: 'Hello and Welcome to Billings Clinic. If you are a new patient please   press one. If you are a returning patient and you need an appointment, please press two. If this is to reschedule, please press 3'
    }

    const prompt = await call.promptTTS(keyPrompt)

    thedigit = prompt.result

    //if-else loop to get to the desired result based on the input from the user
    
    //first option is for a new patient. They will need to leave their phone number for a call back. Follows a similiar struction of the first keyPrompt. Tried to do a verication loop for this but could not get the await to work properly inside a function.
    if (thedigit == 1){
      const newPPrompt = {
        type: 'digits',
        digits_max: 10,
        text: 'Please enter your phone number with the area code for us to call you back'
      }
      const callback_prompt = await call.promptTTS(newPPrompt)
      pNumber = callback_prompt.result
      await call.playTTS({ text: `Thank you. The number you entered was ${pNumber.split('')}`})
      }
      
    
    //2nd option on the menu is for the appointment desk. the phone number would be manuel entered in the code here. could be done as a env variable to keep number private. 
    else if (thedigit == 2){
      await call.playTTS({ text: "We will route you to the appointment desk now"})
      const dialroute = await call.connect({
        type: 'phone',
        to: +11234567890, //would be replaced with actually dept number to be dialed
        from: call.from,
        timeout: 30,
      })
      //checking to see if there is a dial tone to the number
      if (!dialroute.successful){
        await call.playTTS({ text: 'Sorry, there was an error connecting your call. Goodbye'})
      }
    }
    //this is just throws a recording that the option to reach the rescheduling department isn't reachable
    else if (thedigit == 3){
      await call.playTTS({ text: "Currently the department is un reachable. Goodbye"})
      await call.hangup()
    }

    await call.hangup()

    
  }
})

consumer.run();