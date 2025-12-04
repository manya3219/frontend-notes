import { Button } from 'flowbite-react';

export default function CallToAction() {
  return (
    <div className='flex flex-col sm:flex-row p-4 sm:p-6 border border-teal-500 justify-center items-center rounded-tl-3xl rounded-br-3xl text-center gap-4'>
        <div className="flex-1 justify-center flex flex-col px-2 sm:px-4">
            <h2 className='text-xl sm:text-2xl font-semibold'>
                Want to learn more about JavaScript?
            </h2>
            <p className='text-gray-500 my-2 text-sm sm:text-base'>
                Checkout these resources with 100 JavaScript Projects
            </p>
            <Button gradientDuoTone='purpleToPink' className='rounded-tl-xl rounded-bl-none mt-2'>
                <a href="https://www.google.com" target='_blank' rel='noopener noreferrer'>
                    100 JavaScript Projects
                </a>
            </Button>
        </div>
        <div className="p-4 sm:p-7 flex-1 w-full">
            <img 
              src="https://bairesdev.mo.cloudinary.net/blog/2023/08/What-Is-JavaScript-Used-For.jpg" 
              alt="JavaScript"
              className="w-full h-auto rounded-lg"
            />
        </div>
    </div>
  )
}