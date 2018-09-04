const express = require('express');
const app = express();

app.use(require('./routes/po'))

app.get('/', (req,res) => {
    res.json({
        ok: true,
        info: "Api de desdoblamiento de datos de Shopify."
    })
})

app.get('*', (req,res) => {
    res.json({
        ok: false,
        info: "Esta no es una ruta válida."
    })
})

app.listen(process.env.PORT || 5000, () =>{
    console.log('SI CHARCHA')
})