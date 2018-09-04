const request = require('request')
const rp      = require ('request-promise')


class ShopifyDrive{
    //acá obtengo el objeto de la marca
    constructor(opt){
        this.opt = opt
    }

    //función para obtener cantidad y url de orders o products
    getUrl(endpoint, c=undefined, p=1){
        if(c !== undefined){
            console.log(`https://${this.opt.username}:${this.opt.password}@${this.opt.url}/${endpoint}/${c}.json`)
            return `https://${this.opt.username}:${this.opt.password}@${this.opt.url}/${endpoint}/${c}.json`
        }else{
            console.log("pagina: ", p)
            console.log("URL: ", `https://${this.opt.username}:${this.opt.password}@${this.opt.url}/${endpoint}.json?limit=250&page=${p}`)
            return `https://${this.opt.username}:${this.opt.password}@${this.opt.url}/${endpoint}.json?limit=250&page=${p}`
        }
    }

    getCantidad(end){
        let c = 'count'
        return new Promise((resolve, reject) => {
            request(this.getUrl(end, c), (err, resp, body) => {
                if(err){
                    reject(err)
                }else{
                    resolve(JSON.parse(body))
                }
            })
        })
    }

    //Función para obtener los datos desdoblados del api
    getData(endpoint, limite, pagina){
        return new Promise( (resolve, reject) => {
            //Jalo la cantidad total de productos u órdenes
            this.getCantidad(endpoint)
                .then(r => {
                    let iteraciones, pInicial, tasa
                    let promesas = []

                    //si es mayor al límite seteado por el api(en este caso 250)
                    if(Number(r.count)>250){
                        //si los req.params no son nulos
                        if(pagina !== null || limite !== null){
                            iteraciones = Number(limite/250)

                                pInicial = Number(pagina * iteraciones)+1
                                tasa = Number(pagina * iteraciones)

                        }else{
                            iteraciones = r.count/250
                            pInicial = 1
                        }

                        //Iteración para obtener los requests en un arreglo promesas
                        for(let i = 0; i<iteraciones; i++){
                            console.log("ies: ",  i)
                            let peticion = rp(this.getUrl(endpoint, undefined, pInicial))
                            promesas.push(peticion)
                            pInicial ++
                        }

                        //Resolución de todas las promesas con Promise.all
                        Promise.all(promesas)
                            .then( promesa => {
                                let arr = [];
                                let arregloRes = promesa.map( (p, index) => {
                                    let parce = JSON.parse(p);

                                    return parce[endpoint];
                                })

                                //SACAR LOS ELEMENTOS DEL ARREGLO
                                for(let j = 0; j<=arregloRes.length-1; j++){
                                    for(let k =0; k<=arregloRes[j].length-1; k++){
                                        arr.push(arregloRes[j][k]);
                                    }
                                }

                                resolve({"totalItems":r.count, "totalActual": arr.length, "results": arr})

                            })
                            .catch( err => {
                                console.log(err)
                            })

                    }else{
                        //Si el total de productos u órdenes es menor a 250
                        console.log(r.count)
                        request(this.getUrl(endpoint), (err, resp, body) =>{
                            if(err){
                                reject(err)
                            }else{
                                let b = JSON.parse(body)
                                resolve(b[endpoint])
                            }
                        })
                    }

                })
        })
    }

}

module.exports = ShopifyDrive