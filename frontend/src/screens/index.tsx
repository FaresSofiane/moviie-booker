import Header from "@/components/Header";
import MovieList from "@/components/MovieList";

export default function Index() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container py-8 px-4 mx-auto">
                <h1 className="text-2xl font-bold mb-6">Films disponibles</h1>
                <MovieList />
            </main>

        </div>
    );
}