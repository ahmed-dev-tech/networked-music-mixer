import React, { useEffect, useState } from "react";
import { useQueue } from "@/contexts/QueueContext";
import { Trophy } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardEntry {
    username: string;
    totalLikes: number;
    songCount: number;
    averageLikes: number;
}

const Leaderboard: React.FC = () => {
    const { getLeaderboard } = useQueue();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
        []
    );

    useEffect(() => {
        const updateLeaderboard = () => {
            const data = getLeaderboard();
            setLeaderboardData(data);
        };

        // Update initially
        updateLeaderboard();

        // Update every 5 seconds
        const interval = setInterval(updateLeaderboard, 5000);

        return () => clearInterval(interval);
    }, [getLeaderboard]);

    if (leaderboardData.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Trophy className='h-5 w-5' />
                    Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Total Likes</TableHead>
                            <TableHead>Songs</TableHead>
                            <TableHead>Avg. Likes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboardData.map((entry, index) => (
                            <TableRow key={entry.username}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{entry.username}</TableCell>
                                <TableCell>{entry.totalLikes}</TableCell>
                                <TableCell>{entry.songCount}</TableCell>
                                <TableCell>
                                    {entry.averageLikes.toFixed(1)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default Leaderboard;
