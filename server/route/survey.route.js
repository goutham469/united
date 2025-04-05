import { Router } from 'express'
import auth from '../middleware/auth.js'
import { addSurveyQuestion, getAllFormSurveys, getAllProductMetrics, getFormDetails, submitSurveyAnswer, surveyRouterEntry, updateProductViewMetric } from '../controllers/survey.controller.js'
import { deleteTicket, getAllForms, submitForm } from '../controllers/contactus.controller.js'


const surveyRouter = Router()

surveyRouter.get("/",surveyRouterEntry)
surveyRouter.get('/all-form-surveys',getAllFormSurveys)
surveyRouter.get('/all-product-view-metrics',getAllProductMetrics)
surveyRouter.post('/update-product-metrics',updateProductViewMetric)

surveyRouter.post('/add-survey-question' , addSurveyQuestion)
surveyRouter.post('/get-form-details' , getFormDetails)
surveyRouter.post('/submit-survey-answer' , submitSurveyAnswer)

// contact-us routes

surveyRouter.get('/getAllForms' , getAllForms)
surveyRouter.post('/submitForm' , submitForm)
surveyRouter.post('/deleteTicket' , deleteTicket)


export default surveyRouter