const User = require('../models/userModel');

async function createDefaultAdmin() {
    try{
        const adminExist = await User.findOne({role : 'admin'});

        if(adminExist){
            console.log('Admin Already exist');
            
        }

        const defaultAdmin = new User ({
            username:"Admin",
            email:"admin@wanderlust.com",
            role:"admin",
        });
         
        await User.register(defaultAdmin , 'adminwithstrongpassword');

        console.log('Default admin created with email : admin@wanderlust.com and password : adminwithstrongpassword');

    }
    catch(err){
        console.log("error creating default admin :" , err);
    }
}


module.exports = createDefaultAdmin;