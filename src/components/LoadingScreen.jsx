import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export function LoadingScreen({ text = "Loading...", fullScreen = true }) {
  if (!fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full py-12 transition-all duration-300">
        <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
          <DotLottieReact
            src="/loading.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {text && (
          <p className="mt-4 text-base sm:text-lg font-semibold text-muted-foreground animate-pulse tracking-wide">
            {text}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-md transition-all duration-300">
      <div className="w-72 h-72 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] flex items-center justify-center">
        <DotLottieReact
          src="/loading.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {text && (
        <p className="mt-4 text-base sm:text-lg font-semibold text-muted-foreground animate-pulse tracking-wide">
          {text}
        </p>
      )}
    </div>
  )
}
