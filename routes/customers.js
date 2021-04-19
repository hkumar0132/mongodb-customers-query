const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const async = require("async");

const mongoURI = require("../config/key");

// @route GET - Customers having more than 5 orders
router.get("/fetch-customers/more-than-5",  (req, res) => {
  MongoClient.connect(mongoURI, (err, client) => {
    if(err) {
      return { success: false, error: err };
    }
    

    client.db('customers-data').collection('customers').find({ orders_count: { $gt: 5 } })
    .limit(20)
    .toArray(function(err, results) {
      if(err) res.send(err);

      console.log(results);
      res.send(results);
    });

    client.close();
  });

});

// @route GET - Customers whose name starts with Man and have no order in last 30 days
router.get("/fetch-customers/starts-with-man-no-order", (req, res) => {
  MongoClient.connect(mongoURI, (err, client) => {
    if(err) {
      return { success: false, error: err };
    }

    const today = new Date();

    // Getting millisecond time of 30 days back from now
    const date_ms = today.getTime() - 30 * 24 * 60 * 60 * 1000; 

    const utc_prior_date = (new Date(date_ms)).toUTCString();

    client.db('customers-data').collection('customers').find({ first_name: { $regex : /^Man/ }, last_order_date: { $lt: utc_prior_date } })
    .limit(20)
    .toArray(function(err, results) {
      if(err) res.send(err);

      console.log(results);
      res.send(results);
    });

    client.close();
  });
});

// @route GET - Customers who has more than 5 orders and have no order in last 30 days
router.get("/fetch-customers/more-than-5-no-order", (req, res) => {
  MongoClient.connect(mongoURI, (err, client) => {
    if(err) {
      return { success: false, error: err };
    }

    const today = new Date();

    // Getting millisecond time of 30 days back from now
    const date_ms = today.getTime() - 30 * 24 * 60 * 60 * 1000; 

    const utc_prior_date = (new Date(date_ms)).toUTCString();

    client.db('customers-data').collection('customers').find({ last_order_date: { $lt: utc_prior_date }, orders_count: { $gt: 5 }})
    .limit(20)
    .toArray(function(err, results) {
      if(err) res.send(err);

      console.log(results);
      res.send(results);
    });

    client.close();
  });
});

//@route POST - To post 1 million customers data using bulk API
router.post("/post-customers", (req, res) => {
  
  MongoClient.connect(mongoURI, (err, client) => {
  
    if(err) {
      console.log(err);
      return;
    }
  
    let bulk = client.db('customers-data').collection('customers').initializeOrderedBulkOp();
    var count = 0;
    
    const first_names = ["Himanshu", "Anshu", "Mangesh", "Manish", "Suresh"];
    
    const time_start = new Date("January 01, 2021 00:00:00");
    //In milliseconds
    const time_start_ms = time_start.getTime(); // 1609439400000
    
    const time_end = new Date("April 18, 2021 00:00:00"); 
    const time_end_ms = time_end.getTime(); // 1618684200000
    
    async.whilst(
    function() { return count < 1000000; },
      function(callback) {
    
        //Randomly generating orders_count value - B/W 0 and 10 inclusive
        const orders_count = Math.floor(Math.random() * 11);
    
        //Randomly getting first_name from first_names list - B/W 0 and 4 inclusive
        const first_name_index = Math.floor(Math.random() * 5);
    
        //Randomly gengerating time in milliseconds - B/W last 01/01/2021 till 18/04/2021
        let last_order_date = null;
        
        if(orders_count != 0) {
          last_order_date = Math.floor(Math.random() * (time_end_ms - time_start_ms + 1) + time_start_ms);
          last_order_date = (new Date(last_order_date)).toUTCString();
        } 
    
        let document = {
          id:count,
          email:"bob.norman@hostmail.com",
          accepts_marketing:false,
          created_at:"2021-04-01T17:24:20-04:00",
          updated_at:"2021-04-01T17:24:20-04:00",
          first_name:first_names[first_name_index],
          last_name:"Norman",
          orders_count:orders_count,
          state:"disabled",
          total_spent:"199.65",
          last_order_id:450789469,
          last_order_date:last_order_date,
          note:null,
          verified_email:true,
          multipass_identifier:null,
          tax_exempt:false,
          phone:"+16136120707",
          tags:"",
          last_order_name:"#1001",
          currency:"USD",
          addresses:
            [
              {
                id:207119551,
                customer_id:207119551,
                first_name:null,
                last_name:null,
                company:null,
                address1:"Chestnut Street 92",
                address2:"","city":"Louisville",
                province:"Kentucky",
                country:"United States",
                zip:"40202",
                phone:"555-625-1199",
                name:"",
                province_code:"KY",
                country_code:"US",
                country_name:"United States",
                default:true
              }
            ],
            accepts_marketing_updated_at:"2005-06-12T11:57:11-04:00",
            marketing_opt_in_level:null,
            tax_exemptions:[],
            admin_graphql_api_id:"gid://shopify/Customer/207119551",
            default_address:{
              id:207119551,
              customer_id:207119551,
              first_name:null,
              last_name:null,
              company:null,
              address1:"Chestnut Street 92",
              address2:"",
              city:"Louisville",
              province:"Kentucky",
              country:"United States",
              zip:"40202",
              phone:"555-625-1199",
              name:"",
              province_code:"KY",
              country_code:"US",
              country_name:"United States",
              default:true
            }
        };
    
        bulk.insert(document);
        count++;
    
        if(count % 1000 == 0) {
          bulk.execute(function(err, res) {
            bulk = client.db('customers-data').collection('customers').initializeOrderedBulkOp();
            callback(err);
          });
        } else {
          callback();
        }
      },
      function(err) {
        if (err) throw err;
        console.log("Data uploaded successfully!");
      }
    );
    
    client.close();
  });
});

module.exports = router;