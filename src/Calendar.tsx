import { useState, useEffect } from "react";
import Modal from "Modal";
import axios from "axios";

interface DataInfo {
  id: number;
  name: string;
  image: string;
  start_time: Date;
  end_time: Date;
  content: string;
}

interface MiniInfo {
  name: string;
  id: number;
}

export default function Calendar() {
  const week = ["SUN", "MON", "TUE", "WED", "THR", "FRI", "SAT"];
  const time = new Date();
  const [year, setYear] = useState(time.getFullYear());
  const [month, setMonth] = useState(time.getMonth() + 1);
  const [day, setDay] = useState<Array<string>>([]);

  const [opener, setOpener] = useState(false); // Modal Opener
  const [companyList, setCompanyList] = useState<Array<DataInfo>>([]); // 기업 정보 리스트
  const [selectedCompany, setSelectedCompany] = useState<DataInfo>(); // 유저가 클릭한 기업의 정보

  const [startArr, setStartArr] = useState<Array<any>>([]); // 달력 날짜에 따라 시작일, 기업 ID가 저장된 배열
  const [endArr, setEndArr] = useState<Array<any>>([]); // 달력 날짜에 따라 종료일, 기업 ID가 저장된 배열

  const changeNav = (direction: number) => {
    if (month + direction === 13) {
      setYear(year + 1);
      setMonth(1);
    } else if (month + direction === 0) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month + direction);
    }
  };

  const makeCalendar = (yyyy: number, mm: number) => {
    let monthLength = new Date(yyyy, mm, 0).getDate(); // 이번 달 길이
    let monthStart = new Date(yyyy, mm - 1).getDay(); // 이번 달 시작 요일
    let lastday = new Date(yyyy, mm - 1, 0).getDate(); // 지난 달 말일
    let firstday = 1;
    day.splice(0);

    // 달력에 포함된 지난 달 채우기
    for (let j = 0; j < monthStart; j++) {
      if (month > 1) day.unshift(`${month - 1}/${lastday}`);
      else if (month === 1) day.unshift(`12/${lastday}`);
      lastday--;
    }

    // 이번 달 채우기
    for (let i = 1; i < monthLength + 1; i++) day.push(i.toString());

    // 달력에 포함된 다음 달 채우기
    for (let k = day.length % 7; k < 7; k++) {
      if (month < 12) day.push(`${mm + 1}/${firstday}`);
      else if (month === 12) day.push(`1/${firstday}`);
      firstday++;
    }

    setDay([...day]);
  };

  /* 올해 달력의 시작일로부터 입력된 날짜까지의 거리 계산 */
  const calculateLength = (day: string) => {
    let tempMonth = month;
    let tempDay = 1;
    if (day.includes("/")) {
      tempMonth = Number(day.split("/")[0]);
      tempDay = Number(day.split("/")[1]);
    } else {
      tempDay = Number(day);
    }

    let totalLength = new Date(year, 0).getDay();

    for (let i = 1; i < tempMonth; i++) totalLength += new Date(year, i, 0).getDate();
    totalLength += tempDay;

    return totalLength;
  };

  const openModal = (idx: number) => {
    let index = companyList.findIndex(i => i.id === idx);
    setSelectedCompany(companyList[index]);
    setOpener(true);
  };

  const closeModal = (close: boolean) => {
    setOpener(close);
  };

  /* 
    회사 정보를 받아온 후 시작일과 종료일에 따라 startArr, endArr에 { name, id } 저장
    startArr, endArr의 index는 올해 달력의 시작에서 며칠 떨어져 있는지
  */
  const saveSchedule = async () => {
    let lastyearDay = new Date(year, 0).getDay();
    let thisyearDay = 0;
    for (let a = 0; a < 12; a++) thisyearDay += new Date(year, a, 0).getDate();
    let nextyearDay = 7 - new Date(year + 1, 0).getDay();

    startArr.splice(0);
    endArr.splice(0);

    for (let b = lastyearDay; b < lastyearDay + thisyearDay + nextyearDay; b++) {
      startArr[b] = [];
      endArr[b] = [];
    }

    for (let i = 0; i < companyList.length; i++) {
      let start = companyList[i].start_time.toString().split("T")[0];
      let end = companyList[i].end_time.toString().split("T")[0];
      let startLength = lastyearDay;
      let endLength = lastyearDay;

      for (let j = 0; j < Number(start.split("-")[1]) - 1; j++) startLength += new Date(Number(start.split("-")[0]), j, 0).getDate();
      startLength += Number(start.split("-")[2]);

      startArr[startLength].push({ name: companyList[i].name, id: companyList[i].id });
      startArr[startLength].sort(function (a: MiniInfo, b: MiniInfo) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      setStartArr([...startArr]);

      for (let k = 0; k < Number(end.split("-")[1]) - 1; k++) endLength += new Date(Number(end.split("-")[0]), k, 0).getDate();
      endLength += Number(end.split("-")[2]);

      endArr[endLength].push({ name: companyList[i].name, id: companyList[i].id });
      endArr[endLength].sort(function (a: MiniInfo, b: MiniInfo) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
      setEndArr([...endArr]);
    }
  };

  const init = async () => {
    await axios.get("https://frontend-assignments.s3.ap-northeast-2.amazonaws.com/job_postings.json").then(res => {
      if (res) setCompanyList(res.data as Array<DataInfo>);
    });
  };

  useEffect(() => {
    makeCalendar(year, month);
    // eslint-disable-next-line
  }, [month]);

  useEffect(() => {
    saveSchedule();
    // eslint-disable-next-line
  }, [companyList]);

  useEffect(() => {
    init();
    makeCalendar(year, month);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className='calendar-nav'>
        <button
          className='btn-arrow'
          onClick={() => {
            changeNav(-1);
          }}>
          &lt;
        </button>
        <span className='date'>{`${year}.${month < 10 ? `0${month}` : month}`}</span>
        <button
          className='btn-arrow'
          onClick={() => {
            changeNav(1);
          }}>
          &gt;
        </button>
      </div>

      <div>
        {week.map((name: string) => {
          return (
            <div className='calendar-week' key={name}>
              {name}
            </div>
          );
        })}
      </div>

      <div className='calendar-content'>
        {day.length > 0 &&
          day.map((day: string, idx: number) => {
            let index = calculateLength(day);
            return (
              <div key={idx} className='days'>
                <div className='info'>{day}</div>
                <div className='company-list'>
                  {year === Number(new Date().getFullYear()) &&
                    startArr[index].map((info: MiniInfo, idx: number) => {
                      return (
                        <div className='company' key={idx}>
                          <button
                            onClick={() => {
                              openModal(info.id);
                            }}>
                            {`시 ${info.name}`}
                          </button>
                        </div>
                      );
                    })}

                  {year === Number(new Date().getFullYear()) &&
                    endArr[index].map((info: MiniInfo, idx: number) => {
                      return (
                        <div className='company' key={idx}>
                          <button
                            onClick={() => {
                              openModal(info.id);
                            }}>
                            {`끝 ${info.name}`}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>

      {selectedCompany !== undefined && <Modal open={opener} maintain={closeModal} info={selectedCompany} />}
    </>
  );
}
