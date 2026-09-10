export const error = (err,res) => {

    if(err.name === "ValidationError") return res.status(400).send({status:false,msg:err.message})
    if(err.name === "CasteError") return res.status(400).send({status:false,msg:'Invalid mongoose Id'})
    if(err.code == 11000) {
        return res.status(400).send({status:false,msg:`Duplicate value provided at ${object.keys(err.Keyvalue)} ${Object.values(err.values)}`})
    }
    return res.status(500).send({status:false,msg:err.message})
}
