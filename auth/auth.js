const jwt = require('jsonwebtoken');

const secret_key = "CourseBookingAPIB303";

module.exports.createAccessToken= async (user)=>{
	
    const user_data ={
        userId:user.userId,
        email: user.email,

    }
    return jwt.sign(user_data, secret_key,{});
}

module.exports.verify = (request, response, next) => {
	let token = request.headers.authorization;

	if (typeof token === "undefined"){
		return response.send({auth: 'Failed, please include token in the header of the request.'})
	}

	// This will remove the default 'Bearer ' from the token in the authorization header, leaving only the token itself
	token = token.slice(7, token.length);


	jwt.verify(token, secret_key, (error, decoded_token) => {
		if(error){
			return response.send({
				auth: 'Failed',
				message: error.message
			})
		}


        request.user = decoded_token;

		next();
	})
}

// // Verifying if user is admin
// module.exports.verifyAdmin = (request, response, next) => {
// 	if(request.user.isAdmin){
// 		return next();
// 	}

// 	return response.send({
// 		auth: 'Failed',
// 		message: 'Action Forbidden'
// 	})
// }
