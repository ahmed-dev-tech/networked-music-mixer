import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { database } from "@/config/firebase";
import { ref, onValue } from "firebase/database";

interface LeaderboardEntry {
    username: string;
    totalLikes: number;
    songCount: number;
    averageLikes: number;
}

const LeaderboardPage: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Set up real-time updates
        const leaderboardRef = ref(database, "leaderboard");
        const unsubscribe = onValue(leaderboardRef, (snapshot) => {
            const data = snapshot.val();
            console.log("Leaderboard data received:", data);

            if (data) {
                // Convert object to array and sort by totalLikes
                const leaderboardArray = Object.values(
                    data
                ) as LeaderboardEntry[];
                const sortedArray = leaderboardArray.sort(
                    (a, b) => b.totalLikes - a.totalLikes
                );
                console.log("Sorted leaderboard array:", sortedArray);
                setLeaderboard(sortedArray);
            } else {
                setLeaderboard([]);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper function to render rank icon
    const getRankIcon = (position: number) => {
        switch (position) {
            case 0:
                return <Trophy className='h-5 w-5 text-yellow-500' />;
            case 1:
                return <Medal className='h-5 w-5 text-gray-400' />;
            case 2:
                return <Award className='h-5 w-5 text-amber-700' />;
            default:
                return (
                    <span className='text-muted-foreground'>
                        {position + 1}
                    </span>
                );
        }
    };

    return (
        <div className='min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-screen-xl mx-auto'>
                <header className='mb-8 text-center'>
                    <h1 className='text-4xl font-bold tracking-tighter music-gradient bg-clip-text animate-fade-in'>
                        Leaderboard
                    </h1>
                    <p className='mt-2 text-muted-foreground'>
                        Who's bringing the best tunes to the party?
                    </p>
                </header>

                <Card className='mb-6'>
                    <CardHeader className='pb-2'>
                        <CardTitle>Top Contributors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className='flex justify-center items-center py-8'>
                                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-16'>
                                            Rank
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className='text-right'>
                                            Songs Added
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            Total Likes
                                        </TableHead>
                                        <TableHead className='text-right'>
                                            Avg. Likes
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaderboard.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className='text-center py-6'
                                            >
                                                No songs have been added yet.
                                                Start sharing music to appear on
                                                the leaderboard!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leaderboard.map((entry, i) => (
                                            <TableRow key={entry.username}>
                                                <TableCell className='flex items-center justify-center'>
                                                    <div className='flex items-center justify-center w-8 h-8'>
                                                        {getRankIcon(i)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className='font-medium'>
                                                    {entry.username}
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    {entry.songCount}
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    {entry.totalLikes}
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    {entry.averageLikes.toFixed(
                                                        1
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LeaderboardPage;
