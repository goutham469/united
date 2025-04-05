import React, { useEffect, useState } from "react";
import Axios from "../utils/Axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";
import { Link, useParams } from "react-router-dom";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import CardProduct from "../components/CardProduct";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/valideURLConvert";

const ProductListPage = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(1);
  const params = useParams();
  console.log(params)
  const AllSubCategory = useSelector((state) => state.product.allSubCategory);
  const [DisplaySubCatory, setDisplaySubCategory] = useState([]);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 800); // Dynamically check width
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);

  const [mobileData, setMobileData] = useState([]);

  const subCategory = params?.subCategory?.split("-");
  const subCategoryName = subCategory
    ?.slice(0, subCategory?.length - 1)
    ?.join(" ");

  const categoryId = params.category.split("-").slice(-1)[0]; 
  const subCategoryId = params.subCategory.split("-").slice(-1)[0];

  async function getMobileProductData() {
    try {
      let response = await fetch(`${baseURL}/api/product/get-product-by-category-mobile`,
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: categoryId }),
        }
      );

      if (!response.ok) {
        console.error("Mobile product API failed:", response.statusText);
        setMobileData([]); // Fallback to empty data
        return;
      }
 
      const data = await response.json();
      setMobileData(data.data || []); // Use empty array if data is undefined
    } catch (error) {
      console.error("Error fetching mobile product data:", error);
      setMobileData([]);
    }
  }

  const fetchProductdata = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId: categoryId,
          subCategoryId: subCategoryId,
          page: page,
          limit: 200,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        if (responseData.page === 1) {
          setData(responseData.data);
        } else {
          setData([...data, ...responseData.data]);
        }
        setTotalPage(responseData.totalCount);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductdata();
    getMobileProductData();
  }, [params]);

  useEffect(() => {
    const sub = AllSubCategory.filter((s) => {
      const filterData = s.category.some((el) => {
        return el._id === categoryId;
      });

      return filterData ? filterData : null;
    });
    setDisplaySubCategory(sub);
  }, [params, AllSubCategory]);

  useEffect(() => {

    window.scrollTo({
      top:0,
      behavior:"smooth"
    })


    const handleResize = () => {
      const isMobile = window.innerWidth <= 800;
      setIsMobileView(isMobile);
      setInnerWidth(window.innerWidth);
      if (isMobile) getMobileProductData(); // Refresh mobile data on resize
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="sticky top-24 lg:top-20">
      {isMobileView ? (
        <div className="container  p-2 ">
          
          <div  style={{fontSize:"20px",margin:"3px",textTransform:"uppercase",textAlign:"center",fontWeight:"800"}}  >
            { params.category.split('-').slice(0,2).map(p=><label  >{`${p} `}</label> ) }
          </div>

          {/* Mobile View */}
          <div>
            {mobileData.length === 0 ? (
              <p className="text-center mt-4 text-gray-500">No products available.</p>
            ) : (
              mobileData.map((subCategory, idx) => (
                <div key={idx} className="mb-4">

                  {/* Subcategory Title */}
                  <h3 className="font-bold text-lg mb-2">
                    {subCategory.name || "Unnamed Subcategory"}
                  </h3>

                  {/* Horizontal Scroll for Products */}
                  <div className="flex overflow-x-scroll gap-4 scrollbar-hide">
                    {subCategory.products.map((p, index) => (
                      <CardProduct
                        data={p}
                        key={p._id + "CategorywiseProductDisplay" + index}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto grid grid-cols-[90px,1fr] md:grid-cols-[200px,1fr] lg:grid-cols-[280px,1fr]">
          {/* Desktop View */}
          <div className="min-h-[88vh] max-h-[88vh] overflow-y-scroll shadow-md scrollbarCustom bg-white py-2">
            
           
            <div  style={{fontSize:"20px",margin:"3px",textTransform:"uppercase",textAlign:"center",fontWeight:"800"}}  >
              { params.category.split('-').slice(0,2).map(p=><label  >{`${p} `}</label> ) }
            </div>
            
            
            {DisplaySubCatory.map((s, index) => {
              const link = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(
                s.name
              )}-${s._id}`;
              return (
                <Link
                  to={link}
                  key={index}
                  className={`w-full p-2 lg:flex items-center lg:w-full lg:h-16 box-border lg:gap-4 border-b hover:bg-green-100 cursor-pointer ${
                    subCategoryId === s._id ? "bg-green-100" : ""
                  }`}
                >
                  {innerWidth > "1022" && (
                    <div className="rounded box-border">
                      <img
                        src={s.image}
                        alt="subCategory"
                        className="w-14 lg:h-14 lg:w-12 h-full object-scale-down m-2"
                      />
                    </div>
                  )}
                  {innerWidth > "1022" ? (
                    <p className="text-xl text-center lg:text-left lg:text-base m-3">
                      {s.name}
                    </p>
                  ) : (
                    <p style={{ fontSize: "16px", margin: "3px" }}>{s.name}</p>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="sticky top-20">
            <div className="bg-white shadow-md p-4 z-10">
              <h3 className="font-semibold">{subCategoryName}</h3>
            </div>
            <div>
              <div className="min-h-[80vh] max-h-[80vh] overflow-y-auto relative">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 p-4 gap-4">
                  {data.length > 0 &&
                    data.map((p, index) => (
                      <CardProduct
                        data={p}
                        key={p._id + "productSubCategory" + index}
                      />
                    ))}
                </div>
              </div>

              {loading && <Loading />}
            </div>
          </div>
        </div>
      )}
      
    </section>
  );
};

export default ProductListPage;
