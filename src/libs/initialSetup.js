import Role from "../models/m_role";
export const createRoles = async (req, res) => {
  try {
    const count = await Role.estimatedDocumentCount();
    if (count > 0) return;

    await Promise.all([
      new Role({ name: "admin" }).save(),
      new Role({ name: "user" }).save(),
      new Role({ name: "jefe_almacen" }).save(),
      new Role({ name: "almacenero" }).save(),
    ]);
  } catch (error) {
    console.log(error);
  }
};
