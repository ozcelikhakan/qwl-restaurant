export interface BlogDto {
    id: number;
    title: string;
    slug: string;
    summary: string;
    coverImageUrl: string | null;
    tags: string[];
    publishedAt: string | null;
    authorFullName: string;
    commentCount: number;
}

export interface BlogDetailDto {
    id: number;
    title: string;
    slug: string;
    content: string;
    coverImageUrl: string | null;
    tags: string[];
    publishedAt: string | null;
    authorFullName: string;
    comments: BlogCommentDto[];
}

export interface BlogCommentDto {
    id: number;
    authorName: string;
    content: string;
    createdAt: string;
}

export interface CreateBlogDto {
    title: string;
    summary: string;
    content: string;
    coverImageUrl: string | null;
    tags: string[];
}

export interface CreateCommentDto {
    blogId: number;
    authorName: string;
    authorEmail: string;
    content: string;
}