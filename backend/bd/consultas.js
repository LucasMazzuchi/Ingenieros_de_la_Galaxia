export const armar_consulta = (entidad) => {
    let consulta = [];
    let valores = [id];
    entidad.forEach((campo, indice) => {
        consulta.push(`${campo}=$${indice + 2}`);
        valores.push(vehiculo[campo]);
    });
    consulta = consulta.join(", ");
    return { consulta, valores };
};