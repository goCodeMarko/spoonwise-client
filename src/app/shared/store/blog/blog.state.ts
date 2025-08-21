export enum Audience {
  Public = "PUBLIC",
  Seller = "SELLER",
  Buyer = "BUYER",
}
export const AudienceUI: Record<Audience, string> = {
  [Audience.Public]: "Public",
  [Audience.Seller]: "Seller",
  [Audience.Buyer]: "Buyer",
};

export enum BlogStatus {
  Draft = "DRAFT",
  Published = "PUBLISHED",
  Archived = "ARCHIVED",
}
export const BlogStatusUI: Record<BlogStatus, string> = {
  [BlogStatus.Draft]: "Draft",
  [BlogStatus.Published]: "Published",
  [BlogStatus.Archived]: "Archived",
};

export interface IBlog {
  _id?: string;
  audience: Audience;
  status: BlogStatus;
  title: string;
  content: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface IBlogState {
  blogs: IBlog[];
  savedBlogs: IBlog[];
  error: any;
}
