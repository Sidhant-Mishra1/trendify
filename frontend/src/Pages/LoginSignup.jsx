import React, { useState} from 'react'
import './CSS/LoginSignup.css'
// import { response } from 'express';
const LoginSignup = () => {

  const [state,setState]=useState("Login");

  const [formData,setFormData]=useState({
    username:"",
    password:"",
    email:""
  })

  const changeHandler=(e)=>{
    setFormData({...formData,[e.target.name]: e.target.value})
  }

  const login=async()=>{
    console.log("Logged in Successfully",formData)
    let responseData;
    await fetch('https://trendify-backend.onrender.com/login',{
      method:'POST',
      headers:{
        Accept:'application/json',
        'Content-Type':'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response)=>response.json()).then((data)=>responseData=data)

    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token)
      window.location.replace("/")
    }
    else{
      alert(responseData.errors)
    }
  }

  const signup=async()=>{
    console.log("Signed Up Successfully",formData)
    let responseData;
    await fetch('https://trendify-backend.onrender.com/signup',{
      method:'POST',
      headers:{
        Accept:'application/json',
        'Content-Type':'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response)=>response.json()).then((data)=>responseData=data)

    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token)
      window.location.replace("/")
    }
    else{
      alert(responseData.errors)
    }
  }

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
        {state==="Sign Up"?<input name="username" value={formData.username} onChange={changeHandler} placeholder='Your name'/>:<></>}
          <input name="email" value={formData.email} onChange={changeHandler} placeholder='Email Address' />
          <input name="password" value={formData.password} onChange={changeHandler} type='password' placeholder='password' />
        </div>
        <button onClick={()=>{state==="Login"?login():signup()}}>Continue</button>
        {state==="Sign Up"?<p className='loginsignup-login'>Already have an account? <span onClick={()=>{setState("Login")}} >Login here</span></p>:<p className='loginsignup-login'>Create an Account <span onClick={()=>{setState("Sign Up")}}>Click Here</span></p>}
        <div className="loginsignup-agree">
          <input type="checkbox" name='' id=''/>
          <p>By continuing,i agree to the terms of use and privacy policy </p>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup
