import { Document, FilterQuery, Model } from "mongoose"

interface FindOneOptions<T extends Document> {
    model: Model<T> //Generic Type 
    filter?: FilterQuery<T>;
    select?: string;
    populate?: string[];
}



interface CreateOptions<T extends Document> {
  model: Model<T>;
  data: Partial<T> | Partial<T>[];
  options?: Record<string, any>;
}



export const findOne = async <T extends Document>({
    model,
    filter = {},
    select = "",
    populate = [],
}: FindOneOptions<T>) => {
    return await model.findOne(filter).select(select).populate(populate);
};


export const create = async <T extends Document>({
  model,
  data,
  options = { validateBeforeSave: true },
}: CreateOptions<T>): Promise<T | T[]> => {
  return await model.create(data);
};