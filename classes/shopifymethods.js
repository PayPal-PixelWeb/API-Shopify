const request = require('request')
const rp      = require ('request-promise')


class ShopifyDrive{

    constructor(opt){
        this.opt = opt
    }

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

    getData(endpoint, limite, pagina){
        return new Promise( (resolve, reject) => {
            this.getCantidad(endpoint)
                .then(r => {
                    let iteraciones, pInicial, tasa
                    let promesas = []

                    if(Number(r.count)>250){
                        if(pagina !== null || limite !== null){
                            iteraciones = Number(limite/250)

                                pInicial = Number(pagina * iteraciones)+1
                                tasa = Number(pagina * iteraciones)

                        }else{
                            iteraciones = r.count/250
                            pInicial = 1
                        }

                        for(let i = 0; i<iteraciones; i++){
                            console.log("ies: ",  i)
                            let peticion = rp(this.getUrl(endpoint, undefined, pInicial))
                            promesas.push(peticion)
                            pInicial ++
                        }

                        Promise.all(promesas)
                            .then( promesa => {
                                let arr = [];
                                let arregloRes = promesa.map( (p, index) => {
                                    let parce = JSON.parse(p);

                                    return parce[endpoint];
                                })

                                //SACAR LOS ELEMENTOS DEL ARREGLO
                                /* console.log(arregloRes.length) */
                                for(let j = 0; j<=arregloRes.length-1; j++){
                                        console.log("length: ", arregloRes.length)
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