const express = require('express')
const app = express();
require('dotenv').config()

const config = require('../config/config')
const ShopifyMethods = require('../classes/shopifymethods')

app.get('/:marca/:endpoint', (req,res) => {

    let opt = config[req.params.marca]
    let limite = null
    let pagina = null

    if(req.query.limite){
        limite = req.query.limite
    }
    if(req.query.pagina){
        pagina = req.query.pagina
    }

    const shopify = new ShopifyMethods(opt)

    shopify.getData(req.params.endpoint, limite, pagina)
            .then(r => res.json(r))
            .catch(err => {
                console.log(err)
            })

})

module.exports = app