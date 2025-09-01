
const BACKEND_URL = "primekart-production.up.railway.app";

//-----------------------------MODAL ACCESS-----------------------
const modal = document.getElementById("my_modal_1");
const modalMessage = document.getElementById("modal-message");

// -----------------------LOGIN PROCESS HANDLE-------------------
const loginButton = document.getElementById("login-button");
if (loginButton) {
  const loginEmail = document.getElementById("login-email");
  const loginPassword = document.getElementById("login-password");
  const registerButtonPage = document.getElementById("register-button-page");

  loginButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;

    if (email === "" || !email.includes("@")) {
      modalMessage.textContent = "Please enter a valid email address";
      modal.showModal();
    } else if (
      password === "" ||
      password.includes(" ") ||
      password.length < 8
    ) {
      modalMessage.textContent =
        "Please enter a valid password (at least 8 characters, no spaces)";
      modal.showModal();
    } else {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/login`, {
          email: email,
          password: password,
        });
        modalMessage.textContent = response.data.message;
        modal.showModal();
        localStorage.setItem("userId", response.data.userId);

        if (response.data.isAdmin === 1) {
          setTimeout(() => {
            window.location.href = "/pages/dashboard.html";
          }, 2000);
        } else {
          setTimeout(() => {
            window.location.href = "/pages/user.html";
          }, 2000);
        }
      } catch (err) {
        modalMessage.textContent = err.response.data.message;
        modal.showModal();
      }
    }
  });

  registerButtonPage.addEventListener("click", () => {
    window.location.href = "/pages/register.html";
  });
}
//LOGIN PROCESS ENDS HERE---------------------------

//----------------------REGISTRATION PROCESS HANDLE--------------------
const registerButton = document.getElementById("register-button");

if (registerButton) {
  const registerEmail = document.getElementById("register-email");
  const registerPassword = document.getElementById("register-password");
  const registerConfirm = document.getElementById("register-confirm-password");

  registerButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const rEmail = registerEmail.value;
    const rPassword = registerPassword.value;
    const rConfirm = registerConfirm.value;

    if (rEmail === "" || !rEmail.includes("@")) {
      modalMessage.textContent = "Please enter a valid email address";
      modal.showModal();
    } else if (
      rPassword === "" ||
      rPassword.includes(" ") ||
      rPassword.length < 8
    ) {
      modalMessage.textContent =
        "Please enter a valid password (at least 8 characters, no spaces)";
      modal.showModal();
    } else if (rPassword !== rConfirm) {
      modalMessage.textContent = "Passwords don't match";
      modal.showModal();
    } else {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/register`,
          {
            email: rEmail,
            password: rPassword,
          }
        );

        modalMessage.textContent = "Registration successful!";
        modal.showModal();

        setTimeout(() => {
          window.location.href = "/pages/user.html";
        }, 2000);
      } catch (err) {
        if (err.response) {
          modalMessage.textContent = err.response.data.message;
          modal.showModal();
        } else {
          modalMessage.textContent =
            "An error occurred during registration. Please try again later.";
          modal.showModal();
        }
      }
    }
  });
}
// REGISTRATION PROCESS ENDS HERE--------------------

// FORGOT PROCESS START HERE----------
const forgotButton = document.getElementById("forgot-button");

if (forgotButton) {
  const fEmail = document.getElementById("forgot-email");
  const oldPass = document.getElementById("old-password");

  forgotButton.addEventListener("click", async (e) => {
    e.preventDefault();
    const forgotEmail = fEmail.value;
    const prePass = oldPass.value;

    if (forgotEmail === "" || !forgotEmail.includes("@")) {
      modalMessage.textContent = "Please enter a valid email address";
      modal.showModal();
    } else if (prePass.length < 8 || prePass.includes(" ") || prePass === "") {
      modalMessage.textContent =
        "Please enter a valid password (at least 8 characters, no spaces)";
    } else {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/login`, {
          email: forgotEmail,
          password: prePass,
        });

        const userId = response.data.userId;
        const newPassword = document.getElementById("new-password");
        const updatePassword = newPassword.value;

        try {
          const forgotResponse = await axios.post(
            `${BACKEND_URL}/api/forgot_password`,
            {
              userId: userId,
              newPassword: updatePassword,
            }
          );

          modalMessage.textContent = forgotResponse.data.message;
          modal.showModal();

          setTimeout(() => {
            window.location.href = "/pages/index.html";
          }, 2000);
        } catch (err) {
          if (err.response) {
            console.log(err);
            modalMessage.textContent = err.response.data.message;
          } else {
            modalMessage.textContent =
              "An error occurred during process. Please try again later.";
            modal.showModal();
          }
        }
      } catch (err) {
        if (err.response) {
          modalMessage.textContent = err.response.data.message;
          modal.showModal();
        } else {
          modal.textContent =
            "n error occurred during operation. Please try again later.";
          modal.showModal();
        }
      }
    }
  });
}
// FORGOT PROCESS ENDS HERE

const hamburgerBtn = document.getElementById("hamburger-btn");
const hamburgerMenu = document.getElementById("hamburger-menu");
if (hamburgerMenu) {
  hamburgerBtn.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("hidden");
  });
}

//DASHBOARD SECTION START FROM HERE ---------------------------DASHBOARD

const addProductBtn = document.getElementById("add-product-btn");
const productForm = document.getElementById("product-form");

const viewProductButton = document.getElementById("view-product-btn");
const viewProductDiv = document.getElementById("view-product-div");

const deleteProductBtn = document.getElementById("delete-product-btn");
const deleteProductDiv = document.getElementById("delete-product-div");

// ADD PRODUCTS BUTTON PROCESS
if (addProductBtn) {
  addProductBtn.addEventListener("click", () => {
    viewProductDiv.classList.add("hidden");
    deleteProductDiv.classList.add("hidden");
    productForm.classList.toggle("hidden");
  });
}

//VIEW PRODUCT BUTTON
if (viewProductButton) {
  viewProductButton.addEventListener("click", () => {
    productForm.classList.add("hidden");
    deleteProductBtn.classList.add("hidden");
    viewProductDiv.classList.toggle("hidden");
  });
}

//DELETE PRODUCT BUTTON
if (deleteProductBtn) {
  deleteProductBtn.addEventListener("click", () => {
    productForm.classList.add("hidden");
    viewProductDiv.classList.add("hidden");
    deleteProductDiv.classList.toggle("hidden");
  });
}

//ADD PRODUCT PROCESS START FROM HERE
const saveBtn = document.getElementById("save_btn");
const cancelBtn = document.getElementById("cancel_btn");

if (saveBtn) {
  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const productName = document.getElementById("product-name").value;
    const category = document.getElementById("category").value;
    const price = document.getElementById("price").value;
    const quantity = document.getElementById("quantity").value;
    const image = document.getElementById("product_image").files[0];
    const description = document.getElementById("description").value;

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("image", image);
    formData.append("description", description);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/add_products`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      modalMessage.textContent = response.data.message;
      modal.showModal();
    } catch (err) {
      if (err.response) {
        console.log(err);
      } else {
        console.log(
          "An error occurred during product addition. Please try again later."
        );
      }
      modal.showModal();
    }
  });
}

//TOTAL SALES START HERE
const totalSales = document.getElementById("total-sales");
if (totalSales) {
  axios
    .get(`${BACKEND_URL}/api/total_sales`)
    .then((response) => {
      const totalSalesValue = response.data.total_sales || 0;
      totalSales.textContent = `${totalSalesValue} tk`;
    })
    .catch((err) => {
      console.error("Error fetching total sales:", err);
      totalSales.textContent =
        err.response?.data?.message || "Something went wrong";
    });
}

//TOTAL SLAES FOR CURRENT MONTH START HERE
const totalOrders = document.getElementById("total-orders");

if (totalOrders) {
  axios
    .get(`${BACKEND_URL}/api/total_orders`)
    .then((response) => {
      const totalOrderValue = response.data.total_orders || 0;
      totalOrders.textContent = `${totalOrderValue}`;
    })
    .catch((err) => {
      console.log("Error fetching total orders:", err);
      totalOrders.textContent =
        err.response?.data?.message || "Something went wrong";
    });
}

//TOTAL CUSTOMERS START HERE
const totalCustomer = document.getElementById("total_customers");
if (totalCustomer) {
  axios
    .get(`${BACKEND_URL}/api/total_customers`)
    .then((response) => {
      const totalCustomerNumber = response.data.total_customers || 0;
      totalCustomer.textContent = `${totalCustomerNumber}`;
    })
    .catch((err) => {
      console.log("Error fetching total customers:", err);
      totalCustomer.textContent =
        err.response?.data?.message || "Something went wrong";
    });
}

//RECENT ATIVITY START HERE
const recentActivityList = document.getElementById("recent-activity-list");

if (recentActivityList) {
  axios
    .get(`${BACKEND_URL}/api/recent_activity`)

    .then((response) => {
      const recentActivityData = response.data || [];
      recentActivityList.innerHTML = "";

      recentActivityData.forEach((activity) => {
        const li = document.createElement("li");
        li.className = "hover:text-blue-600 transition text-green-600";
        li.textContent = `Customer #${activity.user_id} Completed Order #${activity.order_id} recently`;

        recentActivityList.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Error fetching recent activity:", err);
      recentActivity.innerHTML = `<li class="text-red-600">Failed to load recent activity</li>`;
    });
}

//VIEW ALL PRODUCTS SECTION START HERE
const allProductTableBody = document.getElementById("all_products_table_body");

if (allProductTableBody) {
  axios
    .get(`${BACKEND_URL}/api/view_all_products`)
    .then((response) => {
      const allProducts = response.data.all_products || [];

      allProducts.forEach((product) => {
        const tableRow = document.createElement("tr");
        tableRow.className = `hover:bg-gray-100 transition`;
        tableRow.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${product.product_id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.product_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">$${product.price}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.category}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.stock_quantity}</td>
      `;
        allProductTableBody.appendChild(tableRow);
      });
    })

    .catch((err) => {
      console.log("Error fetching all products", err);
      allProductTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-red-600 text-center">
          Failed to load products
        </td>
      </tr>`;
    });
}

//DELETE PRODUCT PROCESS START FROM HERE
const deleteBtn = document.getElementById("delete_btn");

if (deleteBtn) {
  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const productCode = document.getElementById("product_code").value;

    axios
      .delete(`${BACKEND_URL}/api/delete_product/${productCode}`)

      .then((response) => {
        modalMessage.textContent =
          response.data.message || "Product deleted successfully";
        modal.showModal();
      })
      .catch((err) => {
        console.error("Error deleting product:", err);
        modalMessage.textContent =
          err.response?.data?.message || "Something went wrong";
        modal.showModal();
      });
  });
}

//VIEW TOTAL USERS INFO START HERE
const usersInfoTableData = document.getElementById("users_info_table_body");

if (usersInfoTableData) {
  axios
    .get(`${BACKEND_URL}/api/view_users_info`)

    .then((response) => {
      const userInfo = response.data;

      userInfo.forEach((user) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-100";
        row.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.user_id}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.name}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.email}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.total_orders}</div>
                            </td>
      `;
        usersInfoTableData.appendChild(row);
      });
    })

    .catch((err) => {
      console.error("Error fetching user info:", err);
      usersInfoTable.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-4 text-red-600 text-center">
          Failed to load user information
        </td>
      </tr>`;
    });
}

//IF CLICK ALL BUYERS BUTTON
const viewAllBuyersBtn = document.getElementById("view_all_buyers_btn");

if (viewAllBuyersBtn) {
  viewAllBuyersBtn.addEventListener("click", (e) => {
    e.preventDefault();
    usersInfoTableData.innerHTML = "";

    axios
      .get(`${BACKEND_URL}/api/view_users_info_all`)

      .then((response) => {
        const userInfo = response.data;

        userInfo.forEach((user) => {
          const row = document.createElement("tr");
          row.className = "hover:bg-gray-100";
          row.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.user_id}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.name}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.email}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.total_orders}</div>
                            </td>
      `;
          usersInfoTableData.appendChild(row);
        });
      })

      .catch((err) => {
        console.error("Error fetching user info:", err);
        usersInfoTable.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-4 text-red-600 text-center">
          Failed to load user information
        </td>
      </tr>`;
      });
  });
}

//VIEW ALLL USER SECTION START HERE
const viewAllUser = document.getElementById("all_user_table_body");

if (viewAllUser) {
  axios
    .get(`${BACKEND_URL}/api/view_all_users`)
    .then((response) => {
      const allUser = response.data.all_users || [];
      allUser.forEach((user) => {
        const tableRow = document.createElement("tr");
        tableRow.className = "hover:bg-gray-100 transition";
        tableRow.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.user_id}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.email}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.created_at}</div>
                            </td>

      `;
        viewAllUser.appendChild(tableRow);
      });
    })

    .catch((err) => {
      console.error("Error fetching all users:", err);
      const errorRow = document.createElement("tr");
      errorRow.innerHTML = `
      <td colspan="4" class="px-6 py-4 text-red-600 text-center">
        Failed to load user information
      </td>
    `;
      viewAllUser.appendChild(errorRow);
    });
}

//ALL USER BUTTON START FROM HERE
const viewAllUserBtn = document.getElementById("all_user_btn");

if (viewAllUserBtn) {
  viewAllUserBtn.addEventListener("click", (e) => {
    e.preventDefault();
    viewAllUser.innerHTML = "";
    axios
      .get(`${BACKEND_URL}/api/full_user_info`)
      .then((response) => {
        const allUserInfo = response.data.all_users || [];

        allUserInfo.forEach((user) => {
          const tableRow = document.createElement("tr");
          tableRow.className = "hover:bg-gray-100 transition";
          tableRow.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.user_id}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.email}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${user.created_at}</div>
                            </td>

      `;
          viewAllUser.appendChild(tableRow);
        });
      })

      .catch((err) => {
        console.error("Error fetching all users:", err);
        const errorRow = document.createElement("tr");
        errorRow.innerHTML = `
      <td colspan="4" class="px-6 py-4 text-red-600 text-center">
        Failed to load user information
      </td>
    `;
        viewAllUser.appendChild(errorRow);
      });
  });
}


//ADMIN REPORT SECTION START FROM HERE
const adminReportBtn = document.getElementById("admin_report_btn");
const reportsParent = document.getElementById("reports_parent");

if(adminReportBtn){
  adminReportBtn.addEventListener("click", async () => {
    reportsParent.classList.remove("hidden");
    await loadReports();
  });
}

const loadReports = async () => {
  reportsParent.innerHTML = ""; // Clear previous reports

  try {
    const response = await axios.get(`${BACKEND_URL}/api/get_reports`);
    const allReports = response.data.report;

    if(allReports.length === 0){
      const noReport = document.createElement("p");
      noReport.textContent = "No reports found";
      noReport.className = "text-gray-500 text-center";
      reportsParent.appendChild(noReport);
      return;
    }

    allReports.forEach(report => {
      const reportDiv = document.createElement("div");
      reportDiv.className = "bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition duration-300 border border-gray-200 mb-4";

      const createdAt = new Date(report.created_at).toLocaleString();

      reportDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-semibold text-gray-800">Title: ${report.report_title}</h3>
          <span class="text-sm text-gray-500">User ID: ${report.user_id}</span>
        </div>
        <p class="text-gray-700 mb-2">${report.report_text}</p>
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span>Urgency: ${report.urgency}</span>
          <span>Submitted: ${createdAt}</span>
        </div>
      `;
      reportsParent.appendChild(reportDiv);
    });

  } catch(err){
    console.log("Error fetching data:", err);
    const errorText = document.createElement("p");
    errorText.textContent = err.response?.data?.message || "Error fetching reports";
    errorText.className = "text-red-500 text-center";
    reportsParent.appendChild(errorText);
  }
};


//TOP PRODUCTS ITEM START HERE 
const topProductDiv = document.getElementById("top-products-div");
const topProductUl = document.getElementById("top-products-ul")

if(topProductDiv && topProductUl){
    axios.get(`${BACKEND_URL}/api/top_products`)
    .then(response =>{
      const topProducts = response.data.topProduct;
       
          topProducts.forEach((topProduct) =>{
          const topProductLi = document.createElement("li");
          topProductLi.className="flex justify-between items-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"

          topProductLi.innerHTML=`        
           <span>${topProduct.product_name}</span>
           <span class="font-bold text-gray-900">${topProduct.top_sold}</span>
          `;        
          
          topProductUl.appendChild(topProductLi)
      })

    })

    .catch(err =>{
      console.log(err.response?.data?.message || "something went wrong in top product item");
    })
}

//DASHBOARD SECTION ENDS HERE-------------------------------------------------------------DASHBOARD







//ALL PRODUCTS FOR CARD AND VIEW
const cardContainer = document.getElementById("product-container");

let allProducts = []; // FOR SEARCH FILTERING
if (cardContainer) {
  const loadProducts = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/get_products`
      );
      const productInfo = response.data;
       allProducts = response.data;
      if (productInfo.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No products found.";
        cardContainer.appendChild(emptyMessage);
      } else {
        productInfo.forEach((product) => {
          const card = document.createElement("div");
          card.className =
            "card bg-base-100 h-[400px] shadow-sm overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1";
          card.innerHTML = `
               <figure class="  h-[50%]">
                <img src="http://localhost:3000/uploads/${product.image_url}" class="h-[80%]" alt="${product.product_name}" />
               </figure>
               
               <div class="card-body">
                   <h2 class="font-semibold text-[18px] hover:underline hover:text-blue-600">${product.product_name}</h2>
                   <p class="hover:underline text-[16px]">Price : ${product.price} tk.</p>
                    <p class="hover:underline text-[16px]">Category : ${product.category}</p>

                <div class="card-actions justify-end">
                   <a href="/pages/product_details.html?id=${product.product_id}"><button class="btn btn-primary bg-blue-500 hover:bg-blue-800">View</button></a> 
                </div>

               </div> `;

          cardContainer.appendChild(card);
        });
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      modalMessage.textContent = "Something went wrong";
    }
  };

  window.addEventListener("DOMContentLoaded", loadProducts);
}


//FOR SEARCH FILTERING -------------------------
const searchInput = document.getElementById("search_bar");

function renderProducts(products) {
  cardContainer.innerHTML = ""; 

  if (products.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No products found.";
    cardContainer.appendChild(emptyMessage);
  } else {
    products.forEach((product) => {
      const card = document.createElement("div");
      card.className =
        "card bg-base-100 h-[400px] shadow-sm overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1";
      card.innerHTML = `
           <figure class="h-[50%]">
              <img src="${BACKEND_URL}/uploads/${product.image_url}" class="h-[80%]" alt="${product.product_name}" />
           </figure>
           <div class="card-body">
             <h2 class="font-semibold text-[18px] hover:underline hover:text-blue-600">${product.product_name}</h2>
             <p class="hover:underline text-[16px]">Price : ${product.price} tk.</p>
             <p class="hover:underline text-[16px]">Category : ${product.category}</p>
             <div class="card-actions justify-end">
                <a href="/pages/product_details.html?id=${product.product_id}">
                   <button class="btn btn-primary bg-blue-500 hover:bg-blue-800">View</button>
                </a>
             </div>
           </div>`;
      cardContainer.appendChild(card);
    });
  }
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchText = e.target.value.toLowerCase();

    const filtered = allProducts.filter((p) =>
      p.product_name.toLowerCase().includes(searchText) ||
      p.category.toLowerCase().includes(searchText)
    );
    renderProducts(filtered);
  });
}



//SORTING PROCESS START FROM HERE
const lowToHigh = document.getElementById("low_high");
if(lowToHigh){
    lowToHigh.addEventListener("click", async() => {
        
      axios.get(`${BACKEND_URL}/api/price_low_to_high`)
      .then((response) => {
        const products = response.data.products;
        renderProducts(products);
      })
    })
}

const highToLow = document.getElementById("high_low");
if(highToLow){
    highToLow.addEventListener("click", async() => {
        axios.get(`${BACKEND_URL}/api/price_high_to_low`)
        .then((response) => {
            const products = response.data.products;
            renderProducts(products);
        })
    })
}

const defaultBtn = document.getElementById("default");
if(defaultBtn){
    defaultBtn.addEventListener("click", async() => {
        
     await axios.get(`${BACKEND_URL}/api/view_all_products`)
      .then((response) => {
          const products = response.data.all_products;
          renderProducts(products);
      })
      .catch((error) => {
          console.error("Error fetching all products:", error);
      }); 
    })
}



//CATEGORY FILTER START FROM HERE
const categoryFilter = document.getElementById("category_filter");
if(categoryFilter){
   categoryFilter.addEventListener("change",async(e) => {
        const selectedCategory = e.target.value;
        
        if(selectedCategory ==="All"){

            axios.get(`${BACKEND_URL}/api/view_all_products`)
                  .then((response) => {
                  const products = response.data.all_products;
                   renderProducts(products);
               })
            .catch((error) => {
             console.error("Error fetching all products:", error);
        }); 
            
        }
        else{
           axios.get(`${BACKEND_URL}/api/category_filter?category=${selectedCategory}`)
          .then(response =>{
          const products = response.data.products;
          renderProducts(products);
         })

         .catch(err =>{
          console.log("Error fetching category products:", err);
         })
      }

   })
}





//VIEW PRODUCT DETAILS
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const productDetailsContainer = document.getElementById(
  "product_details_container"
);
const purchaseBtn = document.getElementById("purchase_btn");

const loadProductDetails = async () => {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/get_product?id=${productId}`
    );
    const productInfo = response.data;



    const imgDiv = document.createElement("div");
    imgDiv.className = "flex justify-center items-center h-1/2 pt-15";
    imgDiv.innerHTML = `<img src="${BACKEND_URL}/uploads/${productInfo.image_url}" class="rounded-md h-full " alt="${productInfo.product_name}"></img>`;

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "md:ml-10 pt-15";
    bodyDiv.innerHTML = `
        <h1 class="text-2xl font-bold hover:underline">${productInfo.product_name}</h1>
        <p class="text-xl text-gray-700 mt-2 font-semibold hover:underline">Category : ${productInfo.category}</p>
        <p class="text-xl font-semibold mt-4 hover:underline">Price : ${productInfo.price}.00 tk</p>
        <p class="text-xl  mt-4 "><span class="font-semibold">Description :</span> ${productInfo.description}</p>
        <a href="/pages/buyers.html?id=${productInfo.product_id}&price=${productInfo.price}"><button class="btn btn-primary mt-4 hover:underline" id="purchase_btn">Go to purchase</button></a>
     `;                                          
    productDetailsContainer.appendChild(imgDiv);
    productDetailsContainer.appendChild(bodyDiv);
  } catch (err) {
    console.error("Error fetching product details:", err);
    modalMessage.textContent = "Something went wrong";
    modal.showModal();

  }
};
if(productDetailsContainer){
     loadProductDetails();
}




// RELATED PRODUCTS START HERE
const relatedItemsContainer = document.getElementById(
  "related-items-card-container"
);

const relatedItemsLoad = async () => {
  if (!relatedItemsContainer) return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
      relatedItemsContainer.innerHTML =
        '<p class="text-center text-gray-600 text-lg bg-gray-100 px-6 py-4 rounded-lg shadow-md border border-gray-200">\n  No related items found\n</p>';
      return;
    }

    const { data: currentProduct } = await axios.get(
      `${BACKEND_URL}/api/get_product_by_id?id=${productId}`
    );
    if (!currentProduct || !currentProduct.category) {
      relatedItemsContainer.innerHTML =
        '<p class="text-center text-gray-600 text-lg bg-gray-100 px-6 py-4 rounded-lg shadow-md border border-gray-200">\n  No related items found\n</p>';
      return;
    }

    const response = await axios.get(
      `${BACKEND_URL}/api/get_related_products`,
      {
        params: {
          category: currentProduct.category,
          excludeId: productId,
        },
      }
    );

    const relatedProducts = response.data;

    if (relatedProducts.length === 0) {
      relatedItemsContainer.innerHTML =
        '<p class="text-center text-gray-600 text-lg bg-gray-100 px-6 py-4 rounded-lg shadow-md border border-gray-200">\n  No related items found\n</p>';
      return;
    }

    relatedItemsContainer.innerHTML = "";

    relatedProducts.forEach((product) => {
      const card = document.createElement("div");
      card.className =
        "card bg-base-100 h-[400px] shadow-sm overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1";
      card.innerHTML = `
        <figure class="h-[50%]">
          <img src="${BACKEND_URL}/uploads/${product.image_url}" class="h-[80%]" alt="${product.product_name}" />
        </figure>
        <div class="card-body">
          <h2 class="font-semibold text-[18px] hover:underline hover:text-blue-600">${product.product_name}</h2>
          <p class="hover:underline text-[16px]">Price: ${product.price} tk.</p>
          <p class="hover:underline text-[16px]">Category: ${product.category}</p>
          <div class="card-actions justify-end">
            <a href="/pages/product_details.html?id=${product.product_id}">
              <button class="btn btn-primary bg-blue-500 hover:bg-blue-800">View</button>
            </a>
          </div>
        </div>
      `;

      relatedItemsContainer.appendChild(card);
    });
  } catch (error) {
    console.log("Error fetching related products:", error);
    relatedItemsContainer.innerHTML =
      '<p class="text-center text-gray-600 text-lg bg-gray-100 px-6 py-4 rounded-lg shadow-md border border-gray-200">\n  No related items found\n</p>';
  }
};

window.addEventListener("DOMContentLoaded", relatedItemsLoad);




// BUYERS PROCESS HANDLE HERE
const paymentBtn = document.getElementById("payment_btn");
const totalAmount = document.getElementById("total_amount");

const priceParams = new URLSearchParams(window.location.search);
const product_id = Number(priceParams.get("id"))
const productPrice = priceParams.get("price");


const userId = localStorage.getItem("userId");

if (totalAmount && productPrice)
  totalAmount.textContent = `${productPrice}.00 tk`;

if (paymentBtn) {
  paymentBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value;
    const fName = document.getElementById("full-name").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const zip = document.getElementById("zip").value;
    const country = document.getElementById("country").value;
    const paymentAmount = document.getElementById("payment-amount").value;

    if (productPrice && Number(paymentAmount) === Number(productPrice)) {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/buyers`, {
          userId: userId,
          fullName: fName,
          phone: phone,
          address: address,
          city: city,
          zip: zip,
          country: country,
          paymentAmount: paymentAmount,
          product_id:product_id
        });

        modalMessage.textContent = response.data.message;
        modal.showModal();
        setTimeout(()=>{
              window.location.href = `/pages/product_details.html?id=${productId}&price=${productPrice}`;
        },2000)
        


      } catch (err) {
        console.log("Error processing payment:", err);
        modalMessage.textContent =
          "Error processing payment. Please try again.";
        modal.showModal();
      }
    }
  });
}




//USER MESSAGE PART START FROM HERE
const loadMessage = () => {
  const userId = Number(localStorage.getItem("userId"));
  const receiverId = 1;
  axios
    .get(
      `${BACKEND_URL}/api/get_messages?userId=${userId}&receiverId=${receiverId}`
    )
    .then((response) => {
      const messages = response.data.messages;
      const chatBox = document.getElementById("chat_box_div");
      if (!chatBox) {
        console.error("chat_box element not found in DOM");
        return;
      }
      chatBox.innerHTML = "";
      messages.forEach((msg) => {
        if (
          msg.sender_id === Number(localStorage.getItem("userId")) ||
          msg.sender_id === 1
        ) {
          const parentDiv = document.createElement("div");

          parentDiv.className =
            msg.sender_id == Number(localStorage.getItem("userId"))
              ? "flex"
              : "flex justify-end";

          parentDiv.innerHTML = `

           <div class="${
             msg.sender_id == Number(localStorage.getItem("userId"))
               ? "bg-blue-500 text-white rounded-2xl px-4 py-3 max-w-[75%] shadow-md hover:shadow-lg transition-shadow"
               : "bg-blue-100 text-slate-800 rounded-2xl px-4 py-3 max-w-[75%] shadow-md hover:shadow-lg transition-shadow"
           }">

          <p class="text-sm">${msg.message_text}</p>
          <div class="text-xs text-blue-900 mt-1 text-right">${new Date(
            msg.created_at
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}</div>
          </div>
         `;
          chatBox.appendChild(parentDiv);
        }
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    })

    .catch((err) => {
      console.log("Error loading messages:", err);
    });
};

const userMessageBtn = document.getElementById("user_message_btn");
if (userMessageBtn) {
  userMessageBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const userMessageText = document.getElementById("user_message").value.trim();
    if (!userMessageText) return;

    const userId = localStorage.getItem("userId");
    const receiverId = 1;

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/insert_messages`,
        {
          senderId: Number(userId),
          receiverId: receiverId,
          message: userMessageText,
        }
      );

      if (response.data) {
        loadMessage();
        document.getElementById("user_message").value = "";
      }
    } catch (err) {
      console.log("Error sending user message:", err);
    }
  });
}

if(userMessageBtn){
  loadMessage();
}




// MESSAGE DRAWER START HERE
const messageDrawer = document.getElementById("message_drawer");

if (messageDrawer) {
  axios
    .get(`${BACKEND_URL}/api/get_unread_message_from_user`)
    .then((response) => {
      const messages = response.data.message;  

      messages.forEach((msg) => {
        // avoid duplicate buttons
        if(!document.getElementById(`user_${msg.sender_id}`)){
            const li = document.createElement("li");
            li.className = "mb-2";
            const btn = document.createElement("button");

            btn.classList.add("ml-3","bg-gray-300","hover:bg-gray-400");
            btn.id = `user_${msg.sender_id}`;
            btn.textContent = `New message from User #${msg.sender_id}`;

            btn.addEventListener("click", () => {
              openChatBox(msg.sender_id);
            });

            li.appendChild(btn);
            messageDrawer.appendChild(li);
        }
      });
    })
    .catch((err) => {
      console.log("error fetching unread messages :", err);
    });
}

 

//OPEN CHAT BOX DRAWER 
const openChatBox = sender_id =>{

  const adminChatBox = document.getElementById("admin_chat_box");
  adminChatBox.classList.remove("hidden");
 
  const midSection = document.getElementById("mid_section");
    if (midSection) {
    midSection.classList.add("hidden");
  }

    const userNameEl = adminChatBox.querySelector("h3");
    userNameEl.textContent = `User #${sender_id}`;
    loadAdminMessages(sender_id);
}


//LOAD MEASSAGES FOR ADMIN UI
const loadAdminMessages = sender_id =>{
   
  axios.get(`${BACKEND_URL}/api/load_messages_for_admin?sender_id=${sender_id}`)
  .then(response => {

    const messages = response.data.messages;
    
      const chatBox = document.getElementById("chat-box");
       chatBox.innerHTML = "";

      messages.forEach(msg => {
        const parentDiv = document.createElement("div");

        const isUserMessage = msg.sender_id == sender_id;

        parentDiv.className = isUserMessage ? "flex justify-start" : "flex justify-end";

        parentDiv.innerHTML = `
          <div class="${
            msg.sender_id === sender_id
              ? "bg-gray-200 text-gray-800 rounded-2xl px-4 py-3 max-w-[75%] shadow-md"
              : "bg-blue-500 text-white rounded-2xl px-4 py-3 max-w-[75%] shadow-md"
          }">
            <p class="text-sm">${msg.message_text}</p>
            <div class="text-xs text-blue-800 mt-1 text-right">${new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
          </div>
        `;
        chatBox.appendChild(parentDiv);
      });

      chatBox.scrollTop = chatBox.scrollHeight;
  })
  
}




//ADMIN MESSAGE FORM  FROM WHERE ADMIN SENT MESSAGE TO USER 
const adminMessageForm = document.getElementById("message-form");

if(adminMessageForm){
adminMessageForm.addEventListener("submit",async(e) =>{
  e.preventDefault();

  const messageInput = document.getElementById("message-input");
  const messageText = messageInput.value.trim();
  if(!messageText) return;

  const adminChatBox = document.getElementById("admin_chat_box");
   const userId = Number(adminChatBox.querySelector("h3").textContent.split("#")[1]);

  try{
    await axios.post(`${BACKEND_URL}/api/insert_admin_message`,{
      sender_id:1,
      receiver_id:userId,
      message_text: messageText,      
    })
    messageInput.value = "";
    loadAdminMessages(userId);

  }catch(err){
    console.log("Error sending admin message:", err);
  }
})
}




//USERS SUBMIT REPORT PROCESS HANDLE HERE
const submitReportBtn = document.getElementById("submit_report_btn")
if(submitReportBtn){
submitReportBtn.addEventListener("click",async(e) =>{
  e.preventDefault();
   
  const userId = localStorage.getItem("userId");
  console.log(userId);
  const reportTitle = document.getElementById("report_title").value;
  const  reportText = document.getElementById("report_text").value;
  const  reportUrgency = document.getElementById("urgency").value;

  if(!userId || !reportTitle || !reportText || !reportUrgency){
    console.log("Invalid information");
    return;
  }


  axios.post(`${BACKEND_URL}/api/sent_report`,{

    userId:userId,
    report_title :reportTitle,
    report_text:reportText,
    urgency:reportUrgency
  })

  .then(response => {
    modalMessage.textContent=response.data.message;
    modal.showModal();
  })
  .catch(err =>{
    modalMessage.textContent = err.response?.data?.message || "Something went wrong";
    modal.showModal();
  })
})
}



//LOGOUT MODAL AND LOGOUT PROCESS START FROM HERE
const logoutBtn = document.getElementById("logout");
const logoutModal = document.getElementById("logout_modal");
const logoutOkBtn = document.getElementById("logout_btn");

if(logoutBtn){

  logoutBtn.addEventListener("click",async(e) => {
   await logoutHandler();
  })
}


const logoutHandler = async () => {
  
  logoutModal.showModal();
  if(logoutOkBtn){
    logoutOkBtn.addEventListener("click",() => {
       
      localStorage.removeItem("userId");
      window.location.href = "/pages/index.html";
    })
  }
}


const userDashboardLogoutBtnMobile = document.getElementById("user_dashboard_mobile_logout_btn");
if(userDashboardLogoutBtnMobile){
  userDashboardLogoutBtnMobile.addEventListener("click",async(e) => {
    await logoutHandler();
  })
}


const userDashboardLogoutBtnLg = document.getElementById("user_dashboard_lg_logout_btn");

if(userDashboardLogoutBtnLg){
  userDashboardLogoutBtnLg.addEventListener("click",async(e) =>{
    await logoutHandler();
  })
}



//USER PROFLE DASHBOARD START FROM HERE-------------------------------------------------

//UPDATE PROFILE START FROM HERE
const updateProfileBtn = document.getElementById("update_profile_btn");
const updateProfileForm = document.getElementById("update_profile_form");

if(updateProfileBtn){
  updateProfileBtn.addEventListener("click",(e)=>{
      updateProfileForm.classList.remove("hidden");
  }) 
}



//UPDATE PROFILE FORM START HERE
const profileSavebtn = document.getElementById("profile_save_btn");
if(profileSavebtn){
  profileSavebtn.addEventListener("click",async(e) =>{
    e.preventDefault();

    const name = document.getElementById("full_name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const profilePic = document.getElementById("profile_pic").files[0];
    const userId =Number(localStorage.getItem("userId")); 

    const profileFormData = new FormData();
    profileFormData.append("user_id",userId);
    profileFormData.append("full_name",name);
    profileFormData.append("phone",phone);
    profileFormData.append("address",address);
    profileFormData.append("dob",dob);
    profileFormData.append("gender",gender);

     if (profilePic) {
      profileFormData.append("profile_pic", profilePic);
    }

    if(!name || !phone || !address || !dob || !gender) return;

    axios.post(`${BACKEND_URL}/api/update_profile`,profileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

    .then(response => {
      modalMessage.textContent = response.data.message;
      modal.showModal();
    })

    .catch(err =>{
  modalMessage.textContent = err.response?.data?.message || err.message;
  modal.showModal();
    })
  })
}



//SET PROFILE PIC IN NAVBAR USER DASHBOARD 
const userProfilePicDiv = document.getElementById("user_profile_pic_div");
const profileNameIdDiv = document.getElementById("profile-name-id_div");

if(userProfilePicDiv && profileNameIdDiv){
  loadUserProfileDiv();
}

async function loadUserProfileDiv() {
  const userId = Number(localStorage.getItem("userId"));
  if (!userId) return;

  try {
    const response = await axios.get(`${BACKEND_URL}/api/get_profile_pic?user_id=${userId}`);
    const profileDetails = response.data.profiles;


    userProfilePicDiv.querySelectorAll("img").forEach(img => img.remove());

    const imgDiv = document.createElement("img");
    imgDiv.className = "w-12 h-12 rounded-full";
    imgDiv.src = `${BACKEND_URL}/profiles/${profileDetails.profile_pic || 'default.png'}`;
    userProfilePicDiv.insertBefore(imgDiv, profileNameIdDiv);

    profileNameIdDiv.innerHTML = `
      <h2 class="font-semibold text-gray-800">${profileDetails.full_name}</h2>
      <p class="text-sm text-gray-500">User ID: ${profileDetails.user_id}</p>
    `;

  } catch(err) {
    console.log(err.response?.data?.message || err.message);
  }
}



// VIEW USER TOTAL ORDERS
const userTotalOrdersDiv = document.getElementById("user-total-orders-div");

if(userTotalOrdersDiv){
  const userId = Number(localStorage.getItem("userId"));

 axios.get(`${BACKEND_URL}/api/get_user_total_orders?user_id=${userId}`)
 .then(response => {
     const totalOrders = response.data.total_orders;
     
     const totalOrderText = document.createElement("p");
     totalOrderText.className="text-2xl font-bold text-gray-800 mt-2";
     totalOrderText.textContent = totalOrders;


     userTotalOrdersDiv.appendChild(totalOrderText);

 })
 .catch(err =>{
    console.log(err.response?.data?.message || "something went wrong");
 })
}


//USER TOTAL BILL VIEW
const userTotalBillText = document.getElementById("user-total-bill-text");
if(userTotalBillText){
  const userId = Number(localStorage.getItem("userId"))
  axios.get(`${BACKEND_URL}/api/get_total_bill?user_id=${userId}`)
  .then(response =>{
     const totalAmount = response.data.totalBill;
     userTotalBillText.textContent = `${totalAmount} tk`;
  })

  .catch(err =>{
    console.log(err.response?.data?.message || "Something went wrong in user Total view");
  })
}



//USER TOTAL MESSAGE VIEW 
const userTotalMessgeDiv = document.getElementById("user-total-message-div");
if(userTotalMessgeDiv){
   const userId = Number(localStorage.getItem("userId"));
   
   axios.get(`${BACKEND_URL}/api/get_total_message_count?user_id=${userId}`)
   .then(response =>{
      const totalMessage = response.data.totalMessage;

      const totalMessageText = document.createElement("p");
      totalMessageText.className ="text-2xl font-bold text-gray-800 mt-2";
      totalMessageText.textContent = totalMessage;

      userTotalMessgeDiv.appendChild(totalMessageText);

   })

   .catch(err =>{
    console.log(err.response?.data?.message || "something went wrong in user total message view");
   })
}




//USERS PRODUCTS TABLE START HERE
const viewUserTableBtn = document.getElementById("view-user-table-btn");
const userPurchaseTableDiv = document.getElementById("user-purchase-product-div");
if(viewUserTableBtn){
   viewUserTableBtn.addEventListener("click",()=>{
      userPurchaseTableDiv.classList.remove("hidden");
   })
}


const userProductTableBody = document.getElementById("user_products_table_body");
if(userProductTableBody){
  const userId = Number(localStorage.getItem("userId"));
  
  axios.get(`${BACKEND_URL}/api/user_all_purchase_products?user_id=${userId}`)
  .then(response =>{

     const products = response.data.product || [];

     products.forEach((product) =>{
                const tableRow = document.createElement("tr");
        tableRow.className = "hover:bg-gray-100 transition";
        tableRow.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${product.order_id}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${product.product_name}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${product.price}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${product.category}</div>
          </td>
         <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${product.order_date}</div>
          </td>

      `; userProductTableBody.appendChild(tableRow)
     })

  })

  .catch(err =>{
    console.log(err.response?.data?.message||"something went wrong in user product view tabel");
  })
}

//USER PROFILE DASHBOARD ENDS HERE-----------------------------------------------USER PROFILE DASHBAORD ENDS

//USER PROFILE LOGO START FROM HERE
const userProfileLogo = document.getElementById("user-profile-logo");
if(userProfileLogo){
  const userId = Number(localStorage.getItem("userId"));
  axios.get(`${BACKEND_URL}/api/get_profile_pic?user_id=${userId}`)
  .then(response =>{
    const profilePic = response.data.profiles;
    userProfileLogo.src=`${BACKEND_URL}/profiles/${profilePic.profile_pic}`;

  })
  .catch(err =>{
    console.log(err.response?.data?.message || " something went wrong in userProfile Logo");
  })
}