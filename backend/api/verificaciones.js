
// La función valida que hayan enviado un entero positivo dentro del rango 1-2.147.483.647.
// Si hay un error en la solicitud, enía un error 400 y devuelve. Sino, pasa a la función next pasada por parámetro.
export const validarId = (req, res, next)=>{
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id<=0 || id>2147483647){
        res.status(400).json({error: "El id ingresado debe ser un entero dentro del rango 1-2.147.483.647"})
        return
    }
    next()
};

export const 