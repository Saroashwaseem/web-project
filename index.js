// if(process.env.NODE_ENV != "production") {
//     require('dotenv').config();
// }

// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

// const dbUrl = process.env.ATLASDB_URL;

// main().then(() => {
//     console.log("connected to DB");
// }).catch((err) => {
//     console.log(err);
// });

// async function main() {
//     await mongoose.connect(dbUrl);
// }

// const initDB = async () => {
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj) => ({...obj, owner: "65f498de938bbbafdcf350b8"}))
//     await Listing.insertMany(initData.data);
//     console.log("data was initialized");
// }

// // initDB();


if (process.env.NODE_ENV != "production") {
    require('dotenv').config({ path: '../.env' });
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

const initDB = async () => {
    try {
        // Clear the database
        await Listing.deleteMany({});
        await User.deleteMany({});

        // Create a default admin user
        const adminUser = new User({
            email: "admin@wanderlust.com",
            username: "admin"
        });

        const registeredUser = await User.register(adminUser, "admin123");
        console.log("Admin user created");

        // Add the admin user as owner to all listings
        const listingsWithOwner = initData.data.map((listing) => ({
            ...listing,
            owner: registeredUser._id
        }));

        // Insert all listings
        const insertedListings = await Listing.insertMany(listingsWithOwner);
        console.log(`${insertedListings.length} listings were created`);

    } catch (err) {
        console.log("Error during initialization:", err);
    } finally {
        // Close the connection
        mongoose.connection.close();
    }
};

// Run the initialization
initDB();