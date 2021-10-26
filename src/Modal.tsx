import { useEffect, useRef } from "react";

interface DataInfo {
  id: number;
  name: string;
  image: string;
  start_time: Date;
  end_time: Date;
  content: string;
}

interface Props {
  open: boolean;
  maintain: (close: boolean) => void;
  info: DataInfo;
}

export default function Modal(props: Props) {
  const { open, maintain, info } = props;
  const autoRef = useRef<any>();

  const calLapse = (limit: Date) => {
    let deadline = limit.toString().split("T")[0];
    let today = new Date();
    let lapse =
      new Date(Number(deadline.split("-")[0]), Number(deadline.split("-")[1]) - 1, Number(deadline.split("-")[2])).getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    lapse /= 1000 * 60 * 60 * 24;

    if (lapse > 0) return `(${lapse}일 전)`;
    else if (lapse === 0) return "(오늘)";
    else return `(${Math.abs(lapse)}일 지남)`;
  };

  useEffect(() => {
    const close = (e: any) => {
      if (open && (!autoRef.current || !autoRef.current.contains(e.target))) {
        if (maintain !== undefined) maintain(false);
      }
    };

    window.addEventListener("mousedown", close);

    return () => {
      window.removeEventListener("mousedown", close);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {open && info !== undefined && (
        <div className='modal-background'>
          <div ref={autoRef} className='modal'>
            <div className='info-wrapper'>
              <img src={info.image} alt='logo' />
              <div>
                <p className='info-title'>
                  {info.name}
                  <button
                    className='btn-close'
                    onClick={() => {
                      maintain(false);
                    }}>
                    &times;
                  </button>
                </p>
                <p className='info-schedule'>
                  {`${info.start_time.toString().split("T")[0]} ~ ${info.end_time.toString().split("T")[0]}`}
                  <span className='lapse'>{calLapse(info.end_time)}</span>
                </p>
              </div>
            </div>

            <div dangerouslySetInnerHTML={{ __html: info.content }}></div>
          </div>
        </div>
      )}
    </>
  );
}
