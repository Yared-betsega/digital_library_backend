import bcrypt from 'bcrypt'

export const encrypt = async (password: String) => {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}
