import { FlattenMaps, MongooseUpdateQueryOptions, QueryOptions, UpdateQuery ,UpdateWriteOpResult } from "mongoose";
import { CreateOptions, HydratedDocument, Model, ProjectionType, RootFilterQuery } from "mongoose";


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

    }): Promise<Lean<TDocument> | HydratedDocument<TDocument> | null> {
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
            { ...update, $$inc: { __V: 1 } },
            options);
    }


}