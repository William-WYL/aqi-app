const Footer = () => {
  return (
    <div className="text-center text-sm text-gray-500 py-4">
      © {new Date().getFullYear()} Wei Wang. All rights reserved. Contact: <a href="mailto:weiwang.william.ca@gmail.com" className="text-blue-500 hover:underline">weiwang.william.ca@gmail.com</a>
    </div>
  );
};

export default Footer;