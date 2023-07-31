export interface Movie {
    banner: string;
    detail: string;
    actors: string;
    duration: string;
    rate: string;
    title: string;
}

export interface HotMovie {
    onPlayMvs: Array<Movie>
}

