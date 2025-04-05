import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import SummaryApi, { baseURL } from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { FaAngleRight,FaAngleLeft, FaPlay } from "react-icons/fa6";
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import Divider from '../components/Divider'
import image1 from '../assets/minute_delivery.png'
import image2 from '../assets/Best_Prices_Offers.png'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from '../components/AddToCartButton'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import CardProduct from '../components/CardProduct'
import youtubeImage from '../assets/youtube.png'
import { useSelector } from 'react-redux'


const ProductDisplayPage = () => { 

  const user = useSelector(state => state.user)
  // console.log(user)


  const params = useParams()
  let productId = params?.product?.split("-")?.slice(-1)[0]
  const [recomendationData , setRecomendationData] = useState([])
  const [data,setData] = useState({
    name : "",
    image : []
  })
  const [image,setImage] = useState(0)
  const [loading,setLoading] = useState(false)
  const imageContainer = useRef()

  const [windowWidth , setWindowWidth] = useState(window.innerWidth)

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      // Generate a random index from 0 to i
      const randomIndex = Math.floor(Math.random() * (i + 1));
  
      // Swap the current element with the randomly chosen one
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
  }

  const fetchProductDetails = async()=>{
    try {
        const response = await Axios({
          ...SummaryApi.getProductDetails,
          data : {
            productId : productId 
          }
        })

        const { data : responseData } = response

        if(responseData.success){
          setData(responseData.data)
        }
        console.log(responseData.data)

    } catch (error) {
      AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }

async function getCategoryName(catId) 
{
  // console.log(catId);

  try 
  {
    let response = await fetch(`${baseURL}/api/category/get`);
    let categories = await response.json();
    categories = categories.data;
    // console.log(categories);

    const matchedCategory = categories.find(cat => cat?._id === catId);
    // console.log(matchedCategory);

    if (matchedCategory) 
    {
      setData(prevData => {
        let newData = { ...prevData };
        
        // Ensure more_details exists
        if (!newData.more_details) 
        {
          newData.more_details = {};
        }
        
        newData.more_details.cat = matchedCategory.name;
        return newData;
      });
    } 
    else 
    {
      console.warn(`No matching category found for ID: ${catId}`);
    }
  } 
  catch (error) 
  {
    console.error("Error fetching category:", error);
  }
}


  async function getRecomendationData() 
  {
    console.log("getting recomendation data")
        
    if (!data?.category?.length) {
        console.error("Category data is undefined or empty");
        return;
    }else{
      console.log("category data is VALID ")
    }

    // console.log(data.category[0]); // Check if the category is logged
    try {
        let response = await fetch(`${baseURL}/api/product/get-product-by-category`, {
            method: 'post',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: data.category[0] }),
        });

        response = await response.json();
        // console.log(response);
        // console.log(response.data);

        setRecomendationData(shuffleArray(response.data));
    } catch (error) {
        console.error("Error fetching recommendation data:", error);
    }
}


  useEffect(()=>{
    fetchProductDetails()
    
    window.scroll({
      top:0,
      animation:"smooth"
    })
  },[params])

  

  useEffect(() => {
      if (data.category?.length > 0) {
          getRecomendationData();
          getCategoryName(data.category[0]);
      }

      
  }, [data.category]);
    
    const handleScrollRight = ()=>{
      imageContainer.current.scrollLeft += 100
    }
    const handleScrollLeft = ()=>{
      imageContainer.current.scrollLeft -= 100
    }
  // console.log("product data",data)

  useEffect(()=>{
    window.addEventListener('resize',(e)=>{
      setWindowWidth(window.innerWidth)
    })
  },[])


  useEffect(() => {
    // Capture start time when the component mounts
    const startTime = new Date();

    const formatTime = (time) =>
        `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;

    const handleUnload = () => {
        const endTime = new Date();

        // Calculate viewed time in seconds
        const viewedTime = Math.floor((endTime - startTime) / 1000); // Convert ms to seconds

        const startFormatted = formatTime(startTime);
        const endFormatted = formatTime(endTime);

        // Send data using navigator.sendBeacon for reliability during page unload
        navigator.sendBeacon(
            `${baseURL}/api/survey/update-product-metrics`,
            JSON.stringify({
                productId: data._id,
                userId: user._id,
                viewedTime,
                startTime: startFormatted,
                endTime: endFormatted,
            })
        );
    };

    // Attach `beforeunload` event listener
    window.addEventListener('beforeunload', handleUnload);

    return () => {
        // Capture end time when the component unmounts
        const endTime = new Date();

        // Calculate viewed time in seconds
        const viewedTime = Math.floor((endTime - startTime) / 1000); // Convert ms to seconds

        const startFormatted = formatTime(startTime);
        const endFormatted = formatTime(endTime);

        // Send data to the API
        fetch(`${baseURL}/api/survey/update-product-metrics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: data._id,
                userId: user._id,
                viewedTime,
                startTime: startFormatted,
                endTime: endFormatted,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    console.log('Metrics successfully sent');
                } else {
                    console.error('Failed to send metrics');
                }
            })
            .catch((error) => console.error('Error:', error));

        // Cleanup the `beforeunload` listener
        window.removeEventListener('beforeunload', handleUnload);
    };
}, [data._id, user._id]);


  // Modify the trackHistory function
  const trackHistory = async () => {
    try {
      if (!data._id || !user._id) {
        console.log('Missing required data for history tracking');
        return;
      }

      const response = await fetch(`${baseURL}/api/survey/track-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}` // Add auth token
        },
        body: JSON.stringify({
          productId: data._id,
          userId: user._id
        })
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Failed to track history:', result.message);
      }
    } catch (error) {
      console.error('Error tracking history:', error );
    }
  };

  // Move trackHistory call to the appropriate useEffect
  useEffect(() => {
    if (data._id && user._id) {
      trackHistory();
    }
  }, [data._id, user._id]); // Add dependencies to ensure it runs when data or user changes

  return (
    <div>
      <section className='container mx-auto p-4 grid lg:grid-cols-2 '>
        <div className=''>

            <div className='bg-white lg:min-h-[65vh] lg:max-h-[65vh] rounded min-h-56 max-h-56 h-full w-full'>
               <div className='bg-white lg:min-h-[65vh] lg:max-h-[65vh] rounded min-h-56 max-h-56 h-full w-full relative'>
                  <img
                      src={data.image[image]}
                      className='w-full h-full object-scale-down'
                      alt="content"
                  />
                  {image === -1 && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center overflow-hidden rounded-lg shadow-lg">
                      {data.more_details.embedVideo ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: data.more_details.embedVideo }}
                          className="w-full h-full"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      ) : (
                        <iframe
                          className="w-full h-full rounded-lg shadow-lg"
                          src="https://www.youtube.com/embed/38wisWFVvq8" 
                          title="Embedded Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        ></iframe> 
                      )}
                    </div>
                  )}
                </div>

            </div>


            <div className='flex items-center justify-center gap-3 my-2'>
              {
                data.image.map((img,index)=>{
                  return(
                    <div key={img+index+"point"} className={`bg-slate-200 w-3 h-3 lg:w-5 lg:h-5 rounded-full ${index === image && "bg-slate-300"}`}></div>
                  )
                })
                
              } 

            </div>




            <div className='grid relative'>
                <div ref={imageContainer} className='flex gap-4 z-10 relative w-full overflow-x-auto scrollbar-none p-5'>
                      {
                        data.image.map((img,index)=>{
                          return(
                            <div className='w-24 h-20 min-h-20 min-w-20 scr cursor-pointer ' key={img+index}>
                              <img
                                  src={img}
                                  alt='min-product'
                                  onClick={()=>setImage(index)}
                                  onMouseEnter={()=>setImage(index)}
                                  className='w-full h-full object-scale-down' 
                              />
                            </div>
                          )
                        })
                      }
                      {
                        data.image && (
                          <div 
                            onClick={() => setImage(-1)} 
                            onMouseEnter={()=>setImage(-1)}
                            style={{marginTop:"15px"}}
                          >
                            <button  className='  items-center justify-center'>
                              <img src={youtubeImage} style={{width:"70px"}}/>
                            </button>
                          </div>
                        )
                      }
                </div>
                 
            </div>

             

            
        </div>


        <div className='p-4 lg:pl-7 text-base lg:text-lg'>
            {/* <p className='bg-green-300 w-fit px-2 rounded-full'>Video length 10min</p> */}
            <p style={{fontSize:"16px",color:"#737385"}} >- {data?.more_details?.cat}</p>  
            <h2 className='text-lg font-semibold lg:text-3xl'>{data.name}</h2>  
            {/* <p className=''>{data.unit}</p>  */}
            <Divider/>
            <div>
              <p className=''>Price</p> 
              <div className='flex items-center gap-2 lg:gap-4'>
                <div className='border border-green-600 px-4 py-2 rounded bg-green-50 w-fit'>
                    <p className='font-semibold text-lg lg:text-xl'>{DisplayPriceInRupees(pricewithDiscount(data.price,data.discount))}</p>
                </div>
                {
                  data.discount && (
                    <p className='line-through'>{DisplayPriceInRupees(data.price)}</p>
                  )
                }
                {
                  data.discount && (
                    <p className="font-bold text-green-600 lg:text-2xl">{data.discount}% <span className='text-base text-neutral-500'>Discount</span></p>
                  )
                }
                
              </div>

            </div> 
            <br/>


            {
              data.price == 0?<button 
                                    onClick={(e) => {
                                      e.preventDefault()
                                      window.open(data.more_details.driveLink) 
                                    }  }
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded shadow-sm transition duration-200 ease-in-out"
                                  >
                                Download Now
                              </button>
                              :
                <div className=''>
                  {
                    data.stock == 0 ? (
                      <p className='text-red-500 text-sm text-center'>Out of stock</p>
                    ) : (
                      <AddToCartButton data={data} />
                    )
                  } 
                    
                </div>
            }
              
              {/* {
                data.stock === 0 ? (
                  <p className='text-lg text-red-500 my-2'>Out of Stock</p>
                ) 
                : (
                  // <button className='my-4 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded'>Add</button>
                  <div className='my-4'>
                    <AddToCartButton data={data}/>
                  </div>
                )
              } */}
           <div className='my-4    lg:grid gap-3 '>
                <div>
                    <p className='font-semibold'>Description</p>
                    {/* <p className='text-base'>{data.description}</p> */}
                    {
                      data.description?.split('.').map((line,idx)=><p>{line}</p>)
                    }
                </div>
                {/* <div>
                    <p className='font-semibold'>Unit</p>
                    <p className='text-base'>{data.unit}</p>
                </div> */}
                {/* {
                  data?.more_details && Object.keys(data?.more_details).filter((element)=>element!='driveLink').map((element,index)=>{
                    return(
                      <div>
                          <p className='font-semibold'>{element}</p>
                          <p className='text-base'>{data?.more_details[element]}</p>
                      </div>
                    )
                  })
                } */}
            </div> 

        </div> 
        
    </section>

         
          {
            windowWidth<500?
            <div className='container mx-auto p-5 grid'>
              <h3 style={{fontSize:"24px",fontWeight:"600",marginLeft:"20px"}}>Suggested Products</h3>
              <div style={{display:"flex",justifyContent:"space-around",overflowX:"scroll" }}>
                {
                  shuffleArray(recomendationData)?.map((c,index)=>{
                    // console.log(c);
                    return(
                      <div style={{margin:"5px",width:"230px" }}>
                        <CardProduct
                          data={c}
                          key={index}
                        />
                      </div>
                    )
                  })
                }
              </div>
 
              <br/>
              <div style={{display:"flex",justifyContent:"space-around",overflowX:"scroll" }}>
                {
                  shuffleArray(recomendationData)?.map((c,index)=>{
                    // console.log(c);
                    return(
                      <div style={{margin:"5px",width:"230px" }}>
                        <CardProduct
                          data={c}
                          key={index}
                        />
                      </div>
                    )
                  })
                }
              </div>
              
              <br/>
               
              <div style={{display:"flex",justifyContent:"space-around",overflowX:"scroll" }}>
                {
                  shuffleArray(recomendationData)?.map((c,index)=>{
                    // console.log(c);
                    return(
                      <div style={{margin:"5px",width:"250px" }}>
                        <CardProduct
                          data={c}
                          key={index}
                        />
                      </div>
                    )
                  })
                }
              </div>
            </div>
            :
            <div>
               <h3 style={{fontSize:"24px",fontWeight:"600",marginLeft:"20px"}}>Similar to this</h3>
              <div style={{display:"flex",justifyContent:"space-around",overflowX:"scroll",flexWrap:"wrap"}}>
                {
                shuffleArray(recomendationData)?.map((c,index)=>{
                  // console.log(c);
                  return(
                    <div style={{margin:"5px",width:"200px"}}>
                      <CardProduct
                        data={c}
                        key={index}
                      />
                    </div>
                  )
                })
              }
              </div>
            </div>
          } 

      

    </div>

  )
}

export default ProductDisplayPage
