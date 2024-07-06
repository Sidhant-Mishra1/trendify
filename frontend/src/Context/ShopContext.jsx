// import { application } from "express";
// import { response } from "express";
import React, { createContext,useEffect, useState } from "react";
// import all_product from "../Components/Assets/all_product";
export const ShopContext=createContext(null);
const getDefaultCart=()=>{
    let cart={};
    for (let index = 0; index <=300; index++) {
        cart[index]=0;
    }
    return cart;
}
const ShopContextProvider=(props)=>{

    const [all_product,setAll_product]=useState([])
    const [cartItems, setCartItems]=useState(getDefaultCart());

    useEffect(()=>{
         fetch('https://trendify-backend.onrender.com/allproducts')
         .then((response)=>response.json())
         .then((data)=>setAll_product(data))
         .catch((error) => console.error('Fetch error:', error));
         if (localStorage.getItem('auth-token')) {
            fetch('https://trendify-backend.onrender.com/getcart', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}), // Passing an empty object as the body
                // body:"",
            })
            .then((response) => response.json())
            .then((data) => setCartItems(data))
            .catch((error) => console.error('Fetch error:', error));
        }
        
        },[]) 
        
        
        const addToCart = (itemId) => {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
            const authToken = localStorage.getItem('auth-token');
            
            if (authToken) {
                fetch('https://trendify-backend.onrender.com/addtocart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': authToken,
                    },
                    body: JSON.stringify({ itemId: itemId }), // Correct parameter name 'itemId'
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => console.log(data))
                .catch((error) => console.error('Fetch error:', error));
            }
        };
        
    const removeFromCart=(itemId)=>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1})); 
        const authToken = localStorage.getItem('auth-token');
        if(authToken){
            fetch('https://trendify-backend.onrender.com/removefromcart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': authToken,
                    },
                    body: JSON.stringify({ itemId: itemId }), // Correct parameter name 'itemId'
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => console.log(data))
                .catch((error) => console.error('Fetch error:', error));
        }
    }
    const getTotalCartAmount= ()=>{
        let  totalAmount=0;
        for(const item in cartItems){
            if(cartItems[item]>0){
                let itemInfo=all_product.find((product)=>product.id===Number(item))
                totalAmount+=(itemInfo.new_price)*cartItems[item];
            }
        }
        return totalAmount;
    }
    const getTotalCartItems=()=>{
        let totalItem=0;
        for(const item in cartItems){
            if(cartItems[item]>0){
                totalItem+=cartItems[item];
            }
        }
        return totalItem;
    }
    const contextValue={getTotalCartItems,getTotalCartAmount,all_product,cartItems,addToCart,removeFromCart};
    console.log(cartItems);
    return(
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}
export default ShopContextProvider;