import { useState, useEffect, useMemo } from 'react';
import { Popover, Menu, Dropdown, Button, Checkbox, message, Row } from 'antd';
import { MoreIcon } from './diyIcons';
import { DownOutlined } from '@ant-design/icons';
import styles from './TableFilter.less';

export default (props) => {
  const { columns, setColumns } = props;

  //备份列
  const [bakColumns, setBakColumns] = useState([...columns]);

  //控制选中的状态
  const [checkState, setCheckState] = useState(
    columns.map(({ title }) => ({
      title,
      checked: true,
    })),
  );

  //控制部分选中的样式
  const [indeterminate, setIndeterminate] = useState(false);
  const onClick = (e) => {
    const { key } = e;
    let newCheckState;
    if (key == 0) {
      //全选
      let checked = false;
      //有没选中的就全选
      if (checkState.some((v) => !v.checked)) {
        checked = true;
      }
      newCheckState = checkState.map((v) => ({ ...v, checked }));
      setIndeterminate(false);
    } else {
      const stateIndex = checkState.findIndex((v) => v.title == key);
      let state = checkState[stateIndex];
      state = { ...state, checked: !state.checked };
      newCheckState = [...checkState];
      newCheckState[stateIndex] = state;
      const checkedLength = newCheckState.filter((v) => v.checked).length;
      setIndeterminate(!!checkedLength && checkedLength < checkState.length);
    }
    setCheckState(newCheckState);
  };

  //显隐列
  useEffect(() => {
    setColumns(
      bakColumns.filter(
        ({ title }) => checkState.find((v) => v.title == title).checked,
      ),
    );
  }, [checkState]);

  const overlay = (
    <Menu onClick={onClick}>
      <Menu.Item key="0">
        <Checkbox
          indeterminate={indeterminate}
          checked={checkState.every((v) => v.checked)}
        >
          全选
        </Checkbox>
      </Menu.Item>
      <Menu.Divider />
      {bakColumns.map(({ title }) => (
        <Menu.Item key={title}>
          <Checkbox checked={checkState.find((v) => v.title == title)?.checked}>
            {title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const [visible, setVisible] = useState(false);
  const onVisibleChange = (flag) => {
    setVisible(flag);
  };
  const dropdownProps = {
    overlayClassName: styles.dropdown,
    arrow: true,
    visible,
    onVisibleChange, //触发dropdown时会触发这个事件
    overlay,
  };
  return (
    <Dropdown {...dropdownProps}>
      {
        <Button icon={<MoreIcon />}>
          <DownOutlined />
        </Button>
      }
    </Dropdown>
  );
};
