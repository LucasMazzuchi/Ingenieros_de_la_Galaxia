export const armar_consulta = (id, entidad) => {
    const campos = Object.keys(entidad);
    const consulta = campos
        .map((campo, indice) => `${campo}=$${indice + 2}`)
        .join(", ");
    const valores = [id, ...campos.map((campo) => entidad[campo])];
    return { consulta, valores };
};
