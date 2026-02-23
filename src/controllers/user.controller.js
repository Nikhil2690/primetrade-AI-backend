import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Sonething went wrong while generating access and refresh token")
    }
}

const registerUser = AsyncHandler(async(req, res) => {

    const {name, email, password} = req.body
    console.log("email: " , email )

    if(
        [name,email,password].some((field) => 
        field?.trim === "")
    ){
        throw new APiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}]
    })

    if(existedUser){
        throw new ApiError(400, "User with this email already exists")
    }

    const user = await User.create({
        name,
        email,
        password
    })
    console.log("USER CREATED IN DB:", user);

    const createdUser = await User.findById(user._id).select([
        "-password -refreshToken"
    ])

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Seccessfully")
    )

})

const loginUser = AsyncHandler(async (req, res) => {
    console.log("LOGIN DATA RECEIVED:", req.body);
    const {email, password} = req.body;

    if(!email){
        throw new ApiError(400, "username is required")
    }

    const user = await User.findOne({
        $or: [{email}]
    })

    if(!user){
        throw new ApiError(404, "User doesn't exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password, -refreshToken")

    const options = {
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In successfully"
        )
    )

})

const logoutUser = AsyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, {}, "User logged out successfully")
})

const getCurrentUser = AsyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "User fetched Successfully"
        )
    )
})

const updateUser = AsyncHandler(async (req, res) => {
    const {name, email} = req.body
    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError(404, "User is not available")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name,
                email
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"))
})



export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateUser
}