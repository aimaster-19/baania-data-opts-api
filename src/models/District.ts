import { dbRead } from '../config/database'
import { mongooseDistrictsSchema } from '../entities/baaniaMongoose/districts'

const District = dbRead.model('districts', mongooseDistrictsSchema)

export default District
// import { Document, model, Schema } from "mongoose";

// interface IDistrict extends Document {
//     id: string;
//     map_id: string
//     title: {
//         title_th: string;
//         title_en: string;
//     }
// }

// const DistrinctSchema = new Schema<IDistrict>({
//     id: { type: String, required: true },
//     map_id: { type: String, required: false },
//     title: {
//         title_th: { type: String, required: true },
//         title_en: { type: String, required: false },
//     },
// });

// const District = model<IDistrict>('districts', DistrinctSchema);

// export default District;
