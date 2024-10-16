import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with the UTC plugin
dayjs.extend(utc);

export default dayjs;
