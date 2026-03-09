import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const session = await auth();
  let cartCount = 0;
  let wishlistCount = 0;

  if (session?.user?.id) {
    const [cart, wishlist] = await Promise.all([
      db.cart.findUnique({
        where: { userId: session.user.id },
        include: { items: true },
      }),
      db.wishlistItem.count({
        where: { userId: session.user.id },
      }),
    ]);

    cartCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
    wishlistCount = wishlist;
  }

  return (
    <NavbarClient
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      user={session?.user || null}
    />
  );
}
