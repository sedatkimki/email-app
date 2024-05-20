import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="h-screen w-scre flex justify-center items-center ">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
};

export default Loading;
