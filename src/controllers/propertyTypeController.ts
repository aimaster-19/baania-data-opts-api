import { Request, Response } from 'express'
import PropertyTypeService from '../services/propertyType'

const getPropertyTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title_th } = req.query
    const propertyTypes = await PropertyTypeService.getPropertyTypes(title_th as string)
    res.status(200).json({
      status: 200,
      data: propertyTypes
    })
  } catch (error: any) {
    console.error(error)
    res.status(500).json({
      status: 500,
      message: error.message
    })
  }
}
export default getPropertyTypes
