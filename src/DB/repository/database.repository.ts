import { DeleteResult, FlattenMaps, MongooseUpdateQueryOptions, QueryOptions, Types, UpdateQuery, UpdateWriteOpResult } from "mongoose";
import { CreateOptions, HydratedDocument, Model, ProjectionType, RootFilterQuery } from "mongoose";
import { optional } from "zod";


export type Lean<T> = HydratedDocument<FlattenMaps<T>>
export abstract class DatabaseRepository<TDocument> {

    constructor(protected readonly model: Model<TDocument>) { }

    async create({
        data,
        options,
    }: {
        data: Partial<TDocument>[];
        options?: CreateOptions | undefined;
    }): Promise<HydratedDocument<TDocument>[] | undefined> {
        return await this.model.create(data, options);
    }




    async findOne({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | null;
        options?: QueryOptions<TDocument> | null;

    }): Promise<
        | Lean<TDocument>
        | HydratedDocument<TDocument>
        | null
    > {
        const doc = this.model.findOne(filter).select(select || "")
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }



    async updateOne({
        filter,
        update,
        options

    }:
        {
            filter: RootFilterQuery<TDocument>,
            update: UpdateQuery<TDocument>,
            options?:
            | MongooseUpdateQueryOptions<TDocument>
            | null

        }): Promise<UpdateWriteOpResult> {
        return this.model.updateOne(
            filter,
            { ...update, $inc: { __v: 1 } },
            options);
    }



    async findByIdAndUpdate({
        id,
        update,
        options = { new: true },

    }: {
        id: Types.ObjectId;
        update?: UpdateQuery<TDocument>,
        options?: QueryOptions<TDocument>,
    }): Promise<HydratedDocument<TDocument> | Lean<TDocument> | null> {
        return await this.model.findByIdAndUpdate(
            id,
            { ...update, $inc: { __v: 1 } },
            options,
        )

    }


    async deleteOne({
        filter,
       

    }:
        {
            filter: RootFilterQuery<TDocument>,
    

        }): Promise<DeleteResult> {
        return this.model.deleteOne(
            filter,
        );
    }



}