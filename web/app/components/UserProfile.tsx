import type { UserDTO } from "@saas-template/shared";
import {
  Card,
  CardHeader,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Separator,
  Alert,
  AlertDescription,
} from "./ui";

interface UserProfileProps {
  user: UserDTO;
}

/**
 * UserProfile component that displays user information using the shared UserDTO type.
 * This demonstrates type reusability across the web and mobile apps.
 */
export function UserProfile({ user }: UserProfileProps) {
  const initials = user.firstName?.[0] || user.email[0].toUpperCase();
  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || "User";

  return (
    <Card className="max-w-2xl w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {user.imageUrl ? (
              <AvatarImage
                src={user.imageUrl}
                alt={`${user.firstName || "User"}'s profile`}
              />
            ) : null}
            <AvatarFallback className="text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{fullName}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator />

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            User Details
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-muted-foreground font-medium">User ID:</dt>
              <dd className="text-foreground font-mono text-sm">
                {user.id.slice(0, 12)}...
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground font-medium">Clerk ID:</dt>
              <dd className="text-foreground font-mono text-sm">
                {user.clerkId.slice(0, 12)}...
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground font-medium">First Name:</dt>
              <dd className="text-foreground">{user.firstName || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground font-medium">Last Name:</dt>
              <dd className="text-foreground">{user.lastName || "Not set"}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-muted-foreground font-medium">
                Account Type:
              </dt>
              <dd>
                {user.isAdmin ? (
                  <Badge variant="default">Admin</Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <Alert className="bg-muted border-border">
          <AlertDescription className="text-sm text-muted-foreground">
            <strong className="text-foreground">Shared Type:</strong> This
            component uses the{" "}
            <code className="bg-secondary px-1 rounded text-foreground">
              UserDTO
            </code>{" "}
            type from{" "}
            <code className="bg-secondary px-1 rounded text-foreground">
              @saas-template/shared
            </code>
            , ensuring type safety across web and mobile!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
