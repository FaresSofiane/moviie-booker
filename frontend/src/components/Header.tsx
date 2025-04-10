import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { ReservationsDialog } from "@/components/ReservationsDialog";

export default function Header() {
    const { logout, isAuthenticated } = useAuth();

    return (
        <div className="border-b">
            <div className=" flex h-16 items-center justify-between mx-32">
                <NavigationMenu >
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <Link to="/" className="flex items-center gap-2">
                                {/* Remplacez ceci par votre véritable logo */}
                                <div className="size-8 rounded-md bg-primary flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold">M</span>
                                </div>
                                <span className="font-bold">MovieBooker</span>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {isAuthenticated && (
                    <NavigationMenu >
                        <NavigationMenuList className="flex items-center gap-4">
                            <NavigationMenuItem>
                                <ReservationsDialog />

                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Separator orientation="vertical" className="h-6" />
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Button variant="outline" onClick={logout}>
                                    Se déconnecter
                                </Button>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                )}
            </div>
        </div>
    );
}