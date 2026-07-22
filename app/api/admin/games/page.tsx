import AdminGamesPage from "@/components/games/admin-games-page";
import { getAllGames } from "@/lib/actions";

export default async function Page() {
    const games = await getAllGames()

    return (
        <AdminGamesPage games={games}/>
    )
}