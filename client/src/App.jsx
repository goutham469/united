import { Outlet, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory,setAllSubCategory,setLoadingCategory } from './store/productSlice';
import { useDispatch } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import { handleAddItemCart } from './store/cartProduct'
import GlobalProvider from './provider/GlobalProvider';
import { FaCartShopping } from "react-icons/fa6";
import CartMobileLink from './components/CartMobile';

export const baseURL = import.meta.env.VITE_SERVER_URL;

function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  console.log("server : ",baseURL)


  async function getServer() {
    try {
      let response = await fetch(baseURL);
      let data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching data:", err);
      return { ok: false }; // Handle fetch errors gracefully
    }
  }
  
  async function coldStartLambda() {
    let delay = 100; // Start with 100ms
    while (true) {
      try {
        let data = await getServer();
        if (data.mongoConnection) {
          console.log("Lambda is warmed up");
          break; // Exit the loop once Lambda is warm
        }
      } catch (err) {
        console.error("Error during cold start check:", err);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 5000); // Exponential backoff up to 5 seconds
    }
  }
  
  coldStartLambda();


  

  const fetchUser = async()=>{
      const userData = await fetchUserDetails()
      dispatch(setUserDetails(userData.data))
  }

  const fetchCategory = async()=>{
    try {
        dispatch(setLoadingCategory(true))
        const response = await Axios({
            ...SummaryApi.getCategory
        })
        const { data : responseData } = response

        if(responseData.success){
           dispatch(setAllCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name)))) 
        }
    } catch (error) {
        
    }finally{
      dispatch(setLoadingCategory(false))
    }
  }

  const fetchSubCategory = async()=>{
    try {
        const response = await Axios({
            ...SummaryApi.getSubCategory
        })
        const { data : responseData } = response

        if(responseData.success){
           dispatch(setAllSubCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name)))) 
        }
    } catch (error) {
        
    }finally{
    }
  }

  

  useEffect(()=>{
    coldStartLambda();
    fetchUser()
    fetchCategory()
    fetchSubCategory()
    // fetchCartItem()
  },[])

  return (
    <GlobalProvider> 
      <Header/>
      <main className='min-h-[78vh]'>
          <Outlet/>
      </main>
      <Footer/>
      <Toaster/>
      {
        location.pathname !== '/checkout' && (
          <CartMobileLink/>
        )
      }
    </GlobalProvider>
  )
}

export default App
